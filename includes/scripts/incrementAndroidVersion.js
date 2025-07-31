const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '../../android/app/build.gradle');

try {
  let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

  const versionCodeRegex = /(versionCode\s+)(\d+)/;
  const match = buildGradleContent.match(versionCodeRegex);

  if (match) {
    const currentVersionCode = parseInt(match[2], 10);
    const newVersionCode = currentVersionCode + 1;

    buildGradleContent = buildGradleContent.replace(
      versionCodeRegex,
      `versionCode ${newVersionCode}`
    );

    fs.writeFileSync(buildGradlePath, buildGradleContent, 'utf8');
    console.log(`Successfully incremented versionCode to ${newVersionCode}`);
  } else {
    console.warn('versionCode not found in build.gradle. Manual update may be needed.');
  }
} catch (error) {
  console.error('Error incrementing versionCode:', error);
  process.exit(1); 
}