/**
 * Smoothly scrolls the window to a specified height
 * @param height - The target scroll height in pixels
 */
export const autoScroll = (height: number): void => {
  window.scrollTo({
    top: height,
  });
};
