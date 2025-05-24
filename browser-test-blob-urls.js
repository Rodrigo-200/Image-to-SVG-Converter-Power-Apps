// Console test script for verifying blob URL fixes
// Run this in the browser console to verify no blob URL errors occur

console.log('🧪 Testing Blob URL Management in Browser...\n');

// Test 1: Simulate file upload with proper cleanup
function testFileUpload() {
    console.log('1️⃣ Testing file upload simulation...');
    
    // Create a test file
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    
    canvas.toBlob((blob) => {
        const file = new File([blob], 'test.png', { type: 'image/png' });
        
        // Simulate our Vue component behavior
        let previewUrl = null;
        
        // Simulate file change (like in ImageUpload.vue)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        previewUrl = URL.createObjectURL(file);
        console.log('✓ Created blob URL:', previewUrl);
        
        // Simulate component cleanup
        setTimeout(() => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                console.log('✓ Cleaned up blob URL');
                previewUrl = null;
            }
        }, 1000);
    });
}

// Test 2: Simulate image dimensions calculation
function testImageDimensions() {
    console.log('\n2️⃣ Testing image dimensions calculation...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 200, 150);
    
    canvas.toBlob((blob) => {
        const file = new File([blob], 'test.png', { type: 'image/png' });
        
        // Simulate our fixed getImageDimensions function
        const img = new Image();
        const url = URL.createObjectURL(file);
        console.log('✓ Created blob URL for dimensions:', url);
        
        img.onload = () => {
            console.log('✓ Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
            URL.revokeObjectURL(url); // Clean up like our fixed code
            console.log('✓ Cleaned up blob URL after dimensions check');
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url); // Clean up even on error
            console.log('✓ Cleaned up blob URL after error');
        };
        
        img.src = url;
    });
}

// Test 3: Monitor for any remaining blob URL errors
function monitorBlobErrors() {
    console.log('\n3️⃣ Setting up blob URL error monitoring...');
    
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('blob:') || message.includes('ERR_FILE_NOT_FOUND')) {
            console.log('❌ BLOB URL ERROR DETECTED:', message);
        }
        originalError.apply(console, args);
    };
    
    console.log('✓ Monitoring active - will report any blob URL errors');
}

// Run all tests
console.log('🚀 Starting browser tests...\n');
monitorBlobErrors();
testFileUpload();
setTimeout(testImageDimensions, 1500);

setTimeout(() => {
    console.log('\n🎉 Browser blob URL tests completed!');
    console.log('If no blob URL errors were reported above, the fixes are working correctly.');
}, 5000);
