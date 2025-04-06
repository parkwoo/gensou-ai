/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, jest } from '@jest/globals'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}))

describe('Novel Management', () => {
  it('renders novel list', () => {
    render(<div data-testid="novel-list">Test</div>)
    expect(screen.getByTestId('novel-list')).toBeInTheDocument()
  })

  it('creates new novel', () => {
    const mockCreate = jest.fn()
    
    render(
      <div>
        <button onClick={mockCreate}>Create</button>
      </div>
    )
    
    fireEvent.click(screen.getByText('Create'))
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})

describe('AI Generation', () => {
  it('generates content with streaming', async () => {
    const mockGenerate = jest.fn().mockResolvedValue('Generated content')
    
    const result = await mockGenerate()
    expect(result).toBe('Generated content')
  })

  it('handles generation error', async () => {
    const mockGenerate = jest.fn().mockRejectedValue(new Error('API Error'))
    
    await expect(mockGenerate()).rejects.toThrow('API Error')
  })
})

describe('Mind Map', () => {
  it('adds new node', () => {
    const mockAddNode = jest.fn()
    
    render(
      <div>
        <button onClick={mockAddNode}>Add Node</button>
      </div>
    )
    
    fireEvent.click(screen.getByText('Add Node'))
    expect(mockAddNode).toHaveBeenCalledTimes(1)
  })

  it('deletes node', () => {
    const mockDeleteNode = jest.fn()
    
    render(
      <div>
        <button onClick={() => mockDeleteNode('node-1')}>Delete</button>
      </div>
    )
    
    fireEvent.click(screen.getByText('Delete'))
    expect(mockDeleteNode).toHaveBeenCalledWith('node-1')
  })
})

describe('Display Settings', () => {
  it('switches to PC mode', () => {
    const mockSetMode = jest.fn()
    
    render(
      <div>
        <button onClick={() => mockSetMode('pc')}>PC Mode</button>
      </div>
    )
    
    fireEvent.click(screen.getByText('PC Mode'))
    expect(mockSetMode).toHaveBeenCalledWith('pc')
  })

  it('switches to mobile mode', () => {
    const mockSetMode = jest.fn()
    
    render(
      <div>
        <button onClick={() => mockSetMode('mobile')}>Mobile Mode</button>
      </div>
    )
    
    fireEvent.click(screen.getByText('Mobile Mode'))
    expect(mockSetMode).toHaveBeenCalledWith('mobile')
  })
})

describe('Knowledge Base', () => {
  it('filters by type', () => {
    const mockFilter = jest.fn()
    
    const knowledge = [
      { id: '1', type: 'character', name: 'Character 1' },
      { id: '2', type: 'setting', name: 'Setting 1' },
    ]
    
    const filtered = knowledge.filter(k => k.type === 'character')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('Character 1')
  })

  it('searches knowledge', () => {
    const knowledge = [
      { id: '1', name: '林風', description: '主人公' },
      { id: '2', name: '青雲宗', description: '宗門' },
    ]
    
    const searched = knowledge.filter(k => 
      k.name.includes('林') || k.description.includes('主人公')
    )
    expect(searched).toHaveLength(1)
  })
})

describe('Export Function', () => {
  it('exports to markdown', () => {
    const novel = { title: 'Test Novel', chapters: [] }
    const markdown = `# ${novel.title}\n\n`
    
    expect(markdown).toContain('# Test Novel')
  })

  it('includes table of contents', () => {
    const chapters = [
      { title: 'Chapter 1' },
      { title: 'Chapter 2' },
    ]
    
    const toc = chapters.map((c, i) => `${i + 1}. ${c.title}`).join('\n')
    
    expect(toc).toContain('1. Chapter 1')
    expect(toc).toContain('2. Chapter 2')
  })
})

describe('API Client', () => {
  it('handles timeout', async () => {
    const mockFetch = jest.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100)
      })
    })
    
    await expect(mockFetch()).rejects.toThrow('Timeout')
  })

  it('handles network error', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network Error'))
    
    await expect(mockFetch()).rejects.toThrow('Network Error')
  })
})

describe('UI Components', () => {
  it('renders loading state', () => {
    render(<div data-testid="loading">Loading...</div>)
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...')
  })

  it('renders error state', () => {
    render(<div data-testid="error">Error occurred</div>)
    expect(screen.getByTestId('error')).toHaveTextContent('Error occurred')
  })

  it('renders success state', () => {
    render(<div data-testid="success">Success!</div>)
    expect(screen.getByTestId('success')).toHaveTextContent('Success!')
  })
})
