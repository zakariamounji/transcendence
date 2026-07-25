'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface CodeEditorProps {
  language: 'C' | 'CPP'
  onSubmit: (code: string, stdin: string) => void
  isSubmitting?: boolean
  disabled?: boolean
}

export default function CodeEditor({
  language,
  onSubmit,
  isSubmitting = false,
  disabled = false
}: CodeEditorProps): React.JSX.Element {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [stdin, setStdin] = useState('')

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code, stdin)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTemplate = () => {
    if (language === 'C') {
      return `#include <stdio.h>

int main() {
    // Write your code here
    printf("Hello World\\n");
    return 0;
}`
    }
    return `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello World" << endl;
    return 0;
}`
  }

  const insertTemplate = () => {
    setCode(getTemplate())
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Write Your Solution</h3>
          <p className="text-xs text-muted-foreground">Language: {language}</p>
        </div>
        <div className="flex gap-2">
          {code && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={insertTemplate}
          >
            Template
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <label className="text-xs font-semibold text-muted-foreground">Code</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your solution here..."
          className="flex-1 p-3 bg-background border border-border rounded-lg text-card-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          disabled={disabled || isSubmitting}
          spellCheck="false"
        />
      </div>

      {/* Stdin Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-muted-foreground">Input (Optional)</label>
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Enter test input here..."
          className="p-3 bg-background border border-border rounded-lg text-card-foreground font-mono text-sm h-20 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          disabled={disabled || isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!code.trim() || isSubmitting || disabled}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Code'}
      </Button>
    </div>
  )
}
