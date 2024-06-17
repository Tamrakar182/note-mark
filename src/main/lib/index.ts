import { appDirectoryName, fileEncoding } from '@shared/constants'
import { ensureDir, readdir, readFile, stat, writeFile } from 'fs-extra'
import { homedir } from 'os'
import { NoteInfo } from '@shared/models'
import { CreateNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { dialog } from 'electron'
import path from 'path'

export const getRootDir = () => {
  return path.join(homedir(), appDirectoryName)
}

export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir()

  await ensureDir(rootDir)

  const notesFileName = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileName.filter((fileName) => fileName.endsWith('.md'))

  return Promise.all(notes.map(getNoteInfoFromFileName))
}

export const getNoteInfoFromFileName = async (fileName: string): Promise<NoteInfo> => {
  const fileStats = await stat(path.join(getRootDir(), fileName))

  return {
    title: fileName.replace(/\.md$/, ''),
    lastEditTime: fileStats.mtimeMs
  }
}

export const readNote: ReadNote = async (fileName) => {
  const rootDir = getRootDir()

  return readFile(path.join(rootDir, `${fileName}.md`), { encoding: fileEncoding })
}

export const writeNote: WriteNote = async (fileName, content) => {
  const rootDir = getRootDir()

  console.info('Writing note ' + fileName)
  return writeFile(path.join(rootDir, `${fileName}.md`), content, { encoding: fileEncoding })
}

export const createNote: CreateNote = async () => {
  const rootDir = getRootDir()
  await ensureDir(rootDir)

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'New Note',
    defaultPath: path.join(rootDir, 'Untitled.md'),
    buttonLabel: 'Create',
    properties: ['showOverwriteConfirmation'],
    showsTagField: false,
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  })

  if (canceled || !filePath) {
    console.info('Note creation Cancelled')
    return false
  }

  const { name: fileName, dir: parentDir } = path.parse(filePath)

  if (parentDir !== rootDir) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Creation Failed',
      message: `All notes must be saved under ${rootDir}, Avoid using other directories.`
    })
    return false
  }

  console.info(`Creating note: ${filePath}`)
  await writeFile(filePath, '')

  return fileName
}
