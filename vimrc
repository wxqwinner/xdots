" by shacon

"---------------general-------------
set nocompatible
set encoding=UTF-8
filetype on
filetype plugin indent on
set spell
set mouse=a
set number
set cursorline
set cursorcolumn
set showcmd
set showmatch
set nowrap
set nobackup
set wildmenu
set history=1000
set tabstop=4 shiftwidth=4 expandtab smarttab
set autoindent smartindent cindent
set hlsearch incsearch ignorecase smartcase
syntax enable
set list
set listchars=tab:>-,trail:-
set ttimeoutlen=0
set autoread
au FocusGained,BufEnter * silent! checktime

let g:netrw_banner=0
let g:netrw_liststyle=3
let g:netrw_showhide=1
let g:netrw_winsize=20

"---------------keybinds------------
inoremap jj <Esc>
nnoremap <SPACE> <Nop>
let mapleader=" "
nmap <leader>w :w!<cr>
map <leader>e :Lex<CR>

map <Left> <Nop>
map <Right> <Nop>
map <Up> <Nop>
map <Down> <Nop>

map <Leader>j <c-w>j
map <Leader>k <c-w>k
map <Leader>h <c-w>h
map <Leader>l <c-w>l

vmap <leader><leader>y "+y

nnoremap <leader><leader>p "+p
autocmd BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | execute "normal! g'\"" | endif

nmap <leader>l :call CycleLineNumbers()<CR>
function! CycleLineNumbers()
  if (&number == 1 && &relativenumber == 0)
    set relativenumber
  else
    set number
    set norelativenumber
  endif
endfunc

"----------------pro----------------
if filereadable(expand($HOME . '/.vimrc.pro'))
    source $HOME/.vimrc.pro
endif
