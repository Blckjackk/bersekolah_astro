// Test script untuk memverifikasi media URLs
import { getMediaUrl, getStorageUrl, getDefaultImageUrl } from './src/lib/utils/media-url.ts';

console.log('Testing Media URLs:');
console.log('==================');

// Test getMediaUrl
console.log('getMediaUrl("/assets/image/navbar/logo.png"):', getMediaUrl('/assets/image/navbar/logo.png'));
console.log('getMediaUrl("assets/image/navbar/logo.png"):', getMediaUrl('assets/image/navbar/logo.png'));

// Test getStorageUrl
console.log('getStorageUrl("storage/testimoni/image.jpg"):', getStorageUrl('storage/testimoni/image.jpg'));

// Test getDefaultImageUrl
console.log('getDefaultImageUrl("logo"):', getDefaultImageUrl('logo'));
console.log('getDefaultImageUrl("mentor"):', getDefaultImageUrl('mentor'));
console.log('getDefaultImageUrl("testimoni"):', getDefaultImageUrl('testimoni'));

console.log('\nExpected URLs:');
console.log('- Logo: https://api.bersekolah.com/assets/image/navbar/logo.png');
console.log('- Storage: https://api.bersekolah.com/storage/testimoni/image.jpg');
console.log('- Default Logo: https://api.bersekolah.com/assets/image/navbar/logo.png');
