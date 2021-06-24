const fs = require("fs");
const modifyExif = require('modify-exif');
const piexif = require("piexifjs");
const inquirer = require('inquirer');

(async function() {
  const { camera, lense, film } = await inquirer.prompt([
    {
      type: 'list',
      name: 'camera',
      message: 'Camera Body:',
      choices: [
        {
          name: 'Canon AE-1 Program',
          value: { make: 'Canon', model: 'Canon AE-1 Program', serial: '2124282' },
        },
        {
          name: 'Olympus Infinity Stylus',
          value: { make: 'Olympus', model: 'Olympus Infinity Stylus', serial: '6068948' },
        }
      ],
    },
    {
      type: 'list',
      name: 'lense',
      message: 'Camera Lense:',
      choices: [
        {
          name: 'FD 50mm f/1.8',
          value: { make: 'Canon', model: 'FD50mm f/1.8', serial: 'T507', focalLength: [50, 1] },
        },
        {
          name: 'Olympus 35mm f/3.5',
          value: { make: 'Olympus', model: '35mm f/3.5', serial: '', focalLength: [35, 1] },
        }
      ],
    },
    {
      type: 'list',
      name: 'film',
      message: 'Film Stock:',
      choices: [
        { name: 'Kodak Gold 200', value: { name: 'Kodak Gold 200', iso: 200 } },
        { name: 'Kodak Ultra Max 400', value: { name: 'Kodak Ultra Max 400', iso: 400 } },
        { name: 'Kodak Portra 400', value: { name: 'Kodak Portra 400', iso: 400 } },
        { name: 'Kodak ColorPlus 200', value: { name: 'Kodak ColorPlus 200', iso: 200 } },
      ]
    }
  ]);

  const files = fs.readdirSync('./photos');

  console.log(`Updating ${files.length} files`);

  files.forEach(fileName => {
    if (fileName === '.DS_Store' || fileName === '.gitkeep') return;

    const originalFile = fs.readFileSync(`photos/${fileName}`);

    const newFile = modifyExif(originalFile, data => {
      data['0th'][piexif.ImageIFD.Artist] = 'Jamie Davies'
      data['0th'][piexif.ImageIFD.Copyright] = 'Copyright Jamie Davies 2021'
      data['0th'][piexif.ImageIFD.Make] = camera.make
      data['0th'][piexif.ImageIFD.Model] = camera.model
      data.Exif[piexif.ExifIFD.UserComment] = `Film: ${film.name}`
      data.Exif[piexif.ExifIFD.ISOSpeedRatings] = film.iso
      data.Exif[piexif.ExifIFD.FocalLength] = lense.focalLength
      data.Exif[piexif.ExifIFD.BodySerialNumber] = camera.serial
      data.Exif[piexif.ExifIFD.LensMake] = lense.make
      data.Exif[piexif.ExifIFD.LensModel] = lense.model
      data.Exif[piexif.ExifIFD.LensSerialNumber] = lense.serial
    });

    fs.writeFileSync(`photos/${fileName}`, newFile);
    console.log(`Updated ${fileName} successfully!`);
  });

  console.log('Done');
})();