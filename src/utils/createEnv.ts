import * as fs from 'fs';
import * as path from 'path';

function createFolderStructure(basePath: string, folders: string[]): void {
  folders.forEach((folder) => {
    let folderPath = path.join(basePath, folder);

    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      } 
    } catch (err) {
      console.error(`Error creating folder ${folderPath}: ${err}`);
    }
  });
}

export function createEnvironment() {

// Example usage
let baseFolder = './files';
let foldersToCreate = ['ccode', 'golang', 'cplus', 'java'];

// Create "files" folder in the current working directory
try {
  if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder);
  }
  // Create subfolders within the "files" folder
  createFolderStructure(baseFolder, foldersToCreate);
} catch (err) {
  console.error(`Error creating base folder ${baseFolder}: ${err}`);
}

}