import { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, CheckCheck } from 'lucide-react';

const INITIAL_CONTACTS = [
  { id: 1, name: 'Saran', role: 'Intern', lastMsg: 'I have updated the homepage design.', time: '10:42 AM', online: true, unread: 2 },
  { id: 2, name: 'Abniya', role: 'Director', lastMsg: 'Please check the invoice for Waymax.', time: '09:15 AM', online: true, unread: 0 },
  { id: 3, name: 'Swedha', role: 'Intern', lastMsg: 'The server is back online.', time: 'Yesterday', online: false, unread: 0 },
  { id: 4, name: 'Manisha', role: 'Intern', lastMsg: 'Can we schedule a call tomorrow?', time: 'Yesterday', online: false, unread: 0 },
];

const INITIAL_MESSAGES = {
  1: [
    { id: 1, text: 'Hi, how is the CRM coming along?', sender: 'them', time: '10:30 AM' },
    { id: 2, text: 'It is going great. I just finished the invoice module.', sender: 'me', time: '10:35 AM' },
    { id: 3, text: 'I have updated the homepage design.', sender: 'them', time: '10:42 AM' },
  ],
  2: [
    { id: 1, text: 'Please check the invoice for Waymax.', sender: 'them', time: '09:15 AM' },
  ],
  3: [
    { id: 1, text: 'The server is back online.', sender: 'them', time: 'Yesterday' },
  ],
  4: [
    { id: 1, text: 'Can we schedule a call tomorrow?', sender: 'them', time: 'Yesterday' },
  ]
};

const Messaging = () => {
  const [activeContact, setActiveContact] = useState(INITIAL_CONTACTS[0]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeContact]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
    }));

    setInputText('');
  };

  const filteredContacts = INITIAL_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = messages[activeContact.id] || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">

      {/* LEFT PANE: Contact List */}
      <div className="w-80 border-r border-border flex flex-col bg-background/50">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-white mb-3">Messaging Hub</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-white focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`p-4 border-b border-border/50 cursor-pointer transition-colors flex items-center gap-3 ${activeContact.id === contact.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-white/5'
                }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                  {contact.name.charAt(0)}
                </div>
                {contact.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-semibold text-white truncate">{contact.name}</h3>
                  <span className="text-[10px] text-gray-500">{contact.time}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{contact.lastMsg}</p>
              </div>
              {contact.unread > 0 && activeContact.id !== contact.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                  {contact.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Chat Window */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
              {activeContact.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{activeContact.name}</h2>
              <p className="text-xs text-primary">{activeContact.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <button className="hover:text-white transition-colors"><Phone size={18} /></button>
            <button className="hover:text-white transition-colors"><Video size={18} /></button>
            <button className="hover:text-white transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === 'me'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-surface border border-border text-gray-200 rounded-bl-sm'
                }`}>
                <p className="text-sm">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender === 'me' ? 'text-primary-100/70' : 'text-gray-500'}`}>
                  {msg.time}
                  {msg.sender === 'me' && <CheckCheck size={12} />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface border-t border-border">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <button type="button" className="text-gray-400 hover:text-white p-2">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={!inputText.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messaging;