import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import axios from 'axios';
import { addComment, addCommentV2, addAttachment, extractJiraError } from '../jira-client.js';
import { buildCommentAdf } from '../formatters.js';

const EXT_TO_MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
};

function mimeToExt(mime) {
  for (const [ext, m] of Object.entries(EXT_TO_MIME)) {
    if (m === mime) return ext;
  }
  return '.bin';
}

function defaultFilename(mimeType, index) {
  return `image-${Date.now()}-${index}${mimeToExt(mimeType)}`;
}

async function loadImage(image, index) {
  const filename = image.filename;
  if (image.path) {
    const abs = path.resolve(image.path);
    const buffer = await fs.readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    const mimeType = image.mimeType || EXT_TO_MIME[ext] || 'application/octet-stream';
    return {
      buffer,
      mimeType,
      filename: filename || path.basename(abs),
      alt: image.alt,
    };
  }
  if (image.dataUrl) {
    const match = /^data:([^;,]+)?(?:;base64)?,(.*)$/s.exec(image.dataUrl);
    if (!match) throw new Error(`Invalid dataUrl for image #${index + 1}`);
    const mimeType = image.mimeType || match[1] || 'application/octet-stream';
    const isBase64 = /;base64,/.test(image.dataUrl);
    const buffer = isBase64
      ? Buffer.from(match[2], 'base64')
      : Buffer.from(decodeURIComponent(match[2]), 'utf8');
    return {
      buffer,
      mimeType,
      filename: filename || defaultFilename(mimeType, index),
      alt: image.alt,
    };
  }
  if (image.url) {
    const res = await axios.get(image.url, { responseType: 'arraybuffer' });
    const mimeType =
      image.mimeType || res.headers['content-type']?.split(';')[0] || 'application/octet-stream';
    const urlName = (() => {
      try {
        return path.basename(new URL(image.url).pathname) || null;
      } catch {
        return null;
      }
    })();
    return {
      buffer: Buffer.from(res.data),
      mimeType,
      filename: filename || urlName || defaultFilename(mimeType, index),
      alt: image.alt,
    };
  }
  throw new Error(`Image #${index + 1}: must provide one of path, dataUrl, or url`);
}

const imageSchema = z
  .object({
    path: z.string().optional().describe('Absolute path to a local image file'),
    dataUrl: z
      .string()
      .optional()
      .describe('Base64 data URL, e.g. data:image/png;base64,iVBORw0...'),
    url: z.string().optional().describe('http(s) URL to fetch the image from'),
    filename: z.string().optional().describe('Override the attachment filename'),
    mimeType: z.string().optional().describe('Override the detected MIME type'),
    alt: z.string().optional().describe('Alt text for the embedded image'),
  })
  .describe('Exactly one of path, dataUrl, or url must be provided per image');

export function registerAddComment(server) {
  server.tool(
    'add_comment',
    'Add a comment to a JIRA issue. Optionally uploads images as attachments and embeds them inline in the comment (as if pasted directly).',
    {
      issueKey: z.string().describe('Issue key, e.g. PROJ-123'),
      body: z
        .string()
        .default('')
        .describe('Comment text. May be empty if only attaching images. Rendered as ADF when no images, or wiki markup when images are embedded.'),
      images: z
        .array(imageSchema)
        .optional()
        .describe(
          'Optional images to attach to the issue and embed inline in the comment. Each entry must provide one of path, dataUrl, or url. Images render inline like a pasted screenshot — not as a text link.'
        ),
    },
    async ({ issueKey, body, images }) => {
      try {
        const attachments = [];
        if (images && images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const loaded = await loadImage(images[i], i);
            const uploaded = await addAttachment(
              issueKey,
              loaded.buffer,
              loaded.filename,
              loaded.mimeType
            );
            attachments.push({
              id: uploaded.id,
              filename: uploaded.filename || loaded.filename,
              contentUrl: uploaded.content,
              alt: loaded.alt,
            });
          }
        }

        let comment;
        if (attachments.length > 0) {
          const parts = [];
          if (body && body.trim().length > 0) parts.push(body);
          for (const att of attachments) {
            parts.push(`!${att.filename}!`);
          }
          comment = await addCommentV2(issueKey, parts.join('\n\n'));
        } else {
          const adf = buildCommentAdf(body || '', []);
          comment = await addComment(issueKey, adf);
        }

        const imageNote = attachments.length
          ? ` with ${attachments.length} image(s) embedded inline`
          : '';
        return {
          content: [
            {
              type: 'text',
              text: `Comment added to ${issueKey} (id: ${comment.id})${imageNote}.`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: 'text', text: `Error adding comment to ${issueKey}: ${extractJiraError(err)}` },
          ],
          isError: true,
        };
      }
    }
  );
}
