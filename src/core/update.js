/** Self-update is intentionally disabled for this pinned fork. */
export async function update() {
  return {
    success: false,
    error: 'tv_update is disabled in this pinned fork. Update manually and re-pin.',
  };
}
