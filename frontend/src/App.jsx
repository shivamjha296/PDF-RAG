import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Link, FileText, Bot, User, Trash2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

function App() {
    const [mode, setMode] = useState('url'); // 'url' | 'upload'
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, role: 'system', content: "Hello! I'm your RAG assistant. Provide a PDF document and ask me anything about it." }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a valid PDF file.');
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
                setMode('upload');
            } else {
                setError('Please upload a valid PDF file.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;
        if (mode === 'url' && !url) {
            setError('Please enter a PDF URL.');
            return;
        }
        if (mode === 'upload' && !file) {
            setError('Please upload a PDF file.');
            return;
        }

        const userMsg = { id: Date.now(), role: 'user', content: question };
        setMessages(prev => [...prev, userMsg]);
        setQuestion('');
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('question', userMsg.content);

            if (mode === 'upload') {
                formData.append('file', file);
            } else {
                formData.append('url', url);
            }

            const response = await axios.post('/chat', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const botMsg = { id: Date.now() + 1, role: 'system', content: response.data.answer };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || 'Something went wrong. Please try again.';
            setError(errorMsg);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', content: `Error: ${errorMsg}`, isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([
            { id: 1, role: 'system', content: "Chat cleared. Ready for new questions!" }
        ]);
        setError(null);
    };

    return (
        <div className="flex h-screen bg-bg-dark text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-80 bg-sidebar-dark border-r border-slate-700 flex flex-col p-6 gap-6 shrink-0">
                <div className="flex items-center gap-3 text-primary text-2xl font-bold">
                    <Bot className="w-8 h-8" />
                    <span>RAG Chat</span>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Document Source
                    </h3>

                    <div className="flex bg-bg-dark p-1 rounded-lg border border-slate-700">
                        <button
                            onClick={() => setMode('url')}
                            className={cn(
                                "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all",
                                mode === 'url' ? "bg-sidebar-dark text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            URL
                        </button>
                        <button
                            onClick={() => setMode('upload')}
                            className={cn(
                                "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all",
                                mode === 'upload' ? "bg-sidebar-dark text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            Upload
                        </button>
                    </div>

                    {mode === 'url' ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-slate-400">PDF URL</label>
                            <div className="relative">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/doc.pdf"
                                    className="w-full bg-bg-dark border border-slate-700 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
                            onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
                            onDrop={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); handleDrop(e); }}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf"
                                className="hidden"
                            />
                            <div className="p-3 bg-bg-dark rounded-full group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-300">Click or drag PDF</p>
                                <p className="text-xs text-slate-500 mt-1">Max 10MB</p>
                            </div>
                        </div>
                    )}

                    {file && mode === 'upload' && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate text-primary">{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="p-1 hover:bg-primary/20 rounded text-primary transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-auto bg-bg-dark rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400">Status</span>
                        <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Ready
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Model</span>
                        <span className="text-xs font-medium text-slate-200">Mistral Medium</span>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col bg-bg-dark relative">
                {/* Header */}
                <header className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-bg-dark/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
                    <h2 className="font-semibold text-lg">Assistant</h2>
                    <button
                        onClick={clearChat}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Clear Chat"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 pt-24 pb-32 flex flex-col gap-6">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-4 max-w-3xl mx-auto w-full",
                                msg.role === 'user' ? "flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                msg.role === 'user' ? "bg-primary text-white" : "bg-sidebar-dark text-primary"
                            )}>
                                {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                            </div>

                            <div className={cn(
                                "flex-1 p-4 rounded-2xl leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-primary text-white rounded-tr-none"
                                    : "bg-sidebar-dark text-slate-200 rounded-tl-none border border-slate-700",
                                msg.isError && "border-red-500/50 bg-red-500/10 text-red-200"
                            )}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4 max-w-3xl mx-auto w-full">
                            <div className="w-10 h-10 rounded-full bg-sidebar-dark text-primary flex items-center justify-center shrink-0">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div className="bg-sidebar-dark border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-dark via-bg-dark to-transparent">
                    <div className="max-w-3xl mx-auto relative">
                        {error && (
                            <div className="absolute -top-12 left-0 right-0 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-sidebar-dark border border-slate-700 rounded-xl p-2 shadow-lg focus-within:border-primary/50 transition-colors">
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Ask a question about the document..."
                                className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-500 focus:ring-0 resize-none max-h-32 py-3 px-3"
                                rows={1}
                                style={{ minHeight: '44px' }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !question.trim()}
                                className="p-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                        <p className="text-center text-xs text-slate-500 mt-2">
                            AI can make mistakes. Please verify important information.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
