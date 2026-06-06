import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
function App() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => { fetchNotes() }, [])
  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false })
    if (data) { setNotes(data); setSelectedNote(data[0] || null) }
  }
  const allTags = [...new Set(notes.flatMap(n => JSON.parse(n.tags || '[]')))]
  const filteredNotes = notes.filter(n => {
    const tags = JSON.parse(n.tags || '[]')
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
    const matchesTag = selectedTag ? tags.includes(selectedTag) : true
    return matchesSearch && matchesTag
  })
  async function createNote() {
    const { data } = await supabase.from('notes').insert({ title: 'Untitled Note', content: '', tags: '[]' }).select()
    if (data) { setNotes([data[0], ...notes]); setSelectedNote(data[0]) }
  }
  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    const remaining = notes.filter(n => n.id !== id)
    setNotes(remaining)
    setSelectedNote(remaining[0] || null)
  }
  async function updateNote(field, value) {
    const saveValue = field === 'tags' ? JSON.stringify(value) : value
    await supabase.from('notes').update({ [field]: saveValue }).eq('id', selectedNote.id)
    const updated = notes.map(n => n.id === selectedNote.id ? { ...n, [field]: saveValue } : n)
    setNotes(updated)
    setSelectedNote({ ...selectedNote, [field]: saveValue })
  }
  function addTag(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      const tag = tagInput.trim().toLowerCase()
      const currentTags = JSON.parse(selectedNote.tags || '[]')
      if (!currentTags.includes(tag)) { updateNote('tags', [...currentTags, tag]) }
      setTagInput('')
    }
  }
  function removeTag(tag) {
    const currentTags = JSON.parse(selectedNote.tags || '[]')
    updateNote('tags', currentTags.filter(t => t !== tag))
  }
  function getNoteTags(note) { return JSON.parse(note.tags || '[]') }
  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-4">My Notes</h1>
<button
  onClick={() => setDarkMode(!darkMode)}
  className="text-xl mb-2"
>
  {darkMode ? '☀️' : '🌙'}
</button>
        <input className="bg-gray-700 text-white px-3 py-2 rounded mb-3 outline-none text-sm" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={createNote} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4 text-sm">+ New Note</button>
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">TAGS</p>
          <div className="flex flex-wrap gap-1">
            <span onClick={() => setSelectedTag(null)} className={`px-2 py-1 rounded text-xs cursor-pointer ${selectedTag === null ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>All</span>
            {allTags.map(tag => (
              <span key={tag} onClick={() => setSelectedTag(tag)} className={`px-2 py-1 rounded text-xs cursor-pointer ${selectedTag === tag ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>#{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {filteredNotes.map(note => (
            <div key={note.id} onClick={() => setSelectedNote(note)} className={`p-3 rounded cursor-pointer hover:bg-gray-600 group flex justify-between items-center ${selectedNote?.id === note.id ? 'bg-blue-700' : 'bg-gray-700'}`}>
              <div className="flex flex-col">
                <span className="truncate text-sm">{note.title || 'Untitled Note'}</span>
                <div className="flex gap-1 mt-1">
                  {getNoteTags(note).map(tag => (
                    <span key={tag} className="text-xs text-blue-300">#{tag}</span>
                  ))}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteNote(note.id) }} className="text-gray-400 hover:text-red-400 ml-2 hidden group-hover:block">✕</button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-8 flex flex-col">
        {selectedNote ? (
          <div className="flex flex-col h-full">
            <input className="bg-transparent text-3xl font-bold outline-none w-full mb-4" placeholder="Note title..." value={selectedNote.title} onChange={e => updateNote('title', e.target.value)} />
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              {getNoteTags(selectedNote).map(tag => (
                <span key={tag} className="bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1">#{tag}<button onClick={() => removeTag(tag)} className="hover:text-red-300">✕</button></span>
              ))}
              <input className="bg-transparent outline-none text-sm text-gray-400" placeholder="Add tag and press Enter..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
            </div>
            <textarea className="bg-transparent text-gray-300 outline-none w-full flex-1 resize-none text-lg" placeholder="Start writing your note..." value={selectedNote.content} onChange={e => updateNote('content', e.target.value)} />
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-32 text-lg">No notes yet. Click + New Note to start!</div>
        )}
      </div>
    </div>
  )
}
export default App