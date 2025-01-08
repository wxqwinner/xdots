" curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

call plug#begin('~/.vim/plugged')
    Plug 'dracula/vim', { 'as': 'dracula' } " theme
    Plug 'vim-autoformat/vim-autoformat'    " code format
    Plug 'preservim/nerdcommenter'          " code comment
    Plug 'vim-airline/vim-airline'          " status bar
    Plug 'tpope/vim-fugitive'               " git
    Plug 'ctrlpvim/ctrlp.vim'               " fuzzy search
    Plug 'preservim/tagbar'                 " show tag bar
    Plug 'ludovicchabant/vim-gutentags'     " auto generate tags
    Plug 'luochen1990/rainbow'              " rainbow
    Plug 'tpope/vim-repeat'                 " repeat
    Plug 'puremourning/vimspector'          " debug
    Plug 'neoclide/coc.nvim', {'branch': 'release'} " lsp
call plug#end()

" dracula/vim
colorscheme dracula

" vim-autoformat
let g:autoformat_autoindent = 0
let g:autoformat_retab = 0
let g:autoformat_remove_trailing_spaces = 0
autocmd FileType vim,tex let b:autoformat_autoindent=0
au BufWrite * :Autoformat

" preservim/nerdcommenter
let g:NERDCreateDefaultMappings = 1
let g:NERDSpaceDelims = 1
let g:NERDCompactSexyComs = 1
let g:NERDDefaultAlign = 'left'

nnoremap <Leader>/ <Plug>NERDCommenterToggle
vnoremap <Leader>/ <Plug><C-u>NERDCommenterToggle

" vim-airline/vim-airline
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#buffer_idx_mode = 1
let g:airline#extensions#tabline#formatter = 'default'
set laststatus=2

nmap <leader>1 <Plug>AirlineSelectTab1
nmap <leader>2 <Plug>AirlineSelectTab2
nmap <leader>3 <Plug>AirlineSelectTab3
nmap <leader>4 <Plug>AirlineSelectTab4
nmap <leader>5 <Plug>AirlineSelectTab5
nmap <leader>6 <Plug>AirlineSelectTab6
nmap <leader>7 <Plug>AirlineSelectTab7
nmap <leader>8 <Plug>AirlineSelectTab8
nmap <leader>9 <Plug>AirlineSelectTab9
nmap <leader>0 <Plug>AirlineSelectTab0
nmap <Tab> <Plug>AirlineSelectNextTab
nmap <S-Tab> <Plug>AirlineSelectPrevTab

" luochen1990/rainbow
let g:rainbow_active = 1

" ctrlpvim/ctrlp.vim
let g:ctrlp_user_command = ['.git', 'cd %s && git ls-files -co --exclude-standard']     " 忽略.gitignore中的文件

" preservim/tagbar
map <leader>m :TagbarToggle<CR>

" ludovicchabant/vim-gutentags
let g:gutentags_cache_dir = "~/.cache/tags"
let g:gutentags_modules = ['ctags']

" tpope/vim-fugitive
nnoremap <leader>gs :Git status<CR>
nnoremap <leader>gd :Gvdiffsplit<CR>

" Toggle :Git window
fun! ToggleGitWindow()
    for win in getwininfo()
        if getbufvar(win.bufnr, '&filetype') == "fugitive"
            call win_execute(win.winid, "close")
            return
        endif
    endfor
    Git
endfun

nnoremap <silent><leader>gg :call ToggleGitWindow()<CR>
nnoremap <silent><leader>gG :tab Git<CR>

" puremourning/vimspector
let g:vimspector_enable_mappings = 'VISUAL_STUDIO'
