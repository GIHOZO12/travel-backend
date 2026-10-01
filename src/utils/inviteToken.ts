import crypto from 'crypto';

const INVITE_EXPIRY_HOURS = 48;

// The link emailed to a new/reinvited staff member carries `raw` — high
// entropy (256 bits), so a fast hash is appropriate here (unlike a human
// password, there's no need for bcrypt's deliberate slowness). Only `hash`
// is ever stored; `raw` exists only in memory long enough to put it in the
// email and is never written to the database.
function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function generateInviteToken(): { raw: string; hash: string; expires: Date } {
  const raw = crypto.randomBytes(32).toString('hex');
  return {
    raw,
    hash: hashToken(raw),
    expires: new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000),
  };
}

export { generateInviteToken, hashToken, INVITE_EXPIRY_HOURS };
