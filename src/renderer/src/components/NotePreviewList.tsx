import { noteMock } from '@renderer/store/mocks'
import { ComponentProps } from 'react'
import { NotePreview } from './NotePreview'
import { twMerge } from 'tailwind-merge'

export const NotePreviewList = ({ className, ...props }: ComponentProps<'ul'>) => {
  if (noteMock.length === 0) {
    return (
      <ul className={twMerge('text-center pt-4', className)} {...props}>
        <span>Try Adding Notes🌱</span>
      </ul>
    )
  }
  return (
    <ul className={className} {...props}>
      {noteMock.map((note) => (
        <NotePreview key={note.title + note.lastEditTime} {...note} />
      ))}
    </ul>
  )
}
