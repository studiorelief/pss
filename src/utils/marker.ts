/*
 *============================================================================
 * SCRIPT RECETTAGE
 *============================================================================
 */

import markerSDK from '@marker.io/browser';
export async function initMarker() {
  // Only load marker if URL contains 'webflow'
  if (window.location.href.includes('webflow')) {
    await markerSDK.loadWidget({
      project: '69ba5e0027fdcfd9f633e4fe',
    });
  }
}
