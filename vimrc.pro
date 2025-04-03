" curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

call plug#begin('~/.vim/plugged')
    Plug 'dracula/vim', { 'as': 'dracula' } " theme
    Plug 'vim-autoformat/vim-autoformat'    " code format
    Plug 'preservim/nerdtree'               " files
    Plug 'preservim/nerdcommenter'          " code comment
    Plug 'vim-airline/vim-airline'          " status bar
    Plug 'tpope/vim-fugitive'               " git
    Plug 'Yggdroot/LeaderF', { 'do': ':LeaderfInstallCExtension' }               " fuzzy search
    Plug 'preservim/tagbar'                 " show tag bar
    Plug 'ludovicchabant/vim-gutentags'     " auto generate tags
    Plug 'luochen1990/rainbow'              " rainbow
    Plug 'tpope/vim-repeat'                 " repeat
    Plug 'puremourning/vimspector'          " debug
    Plug 'skywind3000/asynctasks.vim'       " async tasks
    Plug 'skywind3000/asyncrun.vim'         " async run
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

" preservim/nerdtree
let NERDTreeShowHidden = 1
let NERDTreeIgnore = ['^\.git$', '^node_modules$', '^\.cache$', '^\.vscode$', '^__pycache__$', '^build.*[[dir]]', '^legacy$[[dir]]', '^data$']
map <Leader>e :NERDTreeToggle<CR>

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

" Yggdroot/LeaderF
let g:Lf_WindowPosition = 'popup'
nnoremap <C-F> :Leaderf rg<CR>

let g:Lf_ShortcutF = "<leader>ff"
noremap <leader>fb :<C-U><C-R>=printf("Leaderf buffer %s", "")<CR><CR>
noremap <leader>fm :<C-U><C-R>=printf("Leaderf mru %s", "")<CR><CR>
noremap <leader>ft :<C-U><C-R>=printf("Leaderf bufTag %s", "")<CR><CR>
noremap <leader>fl :<C-U><C-R>=printf("Leaderf line %s", "")<CR><CR>

"noremap <Leader>f :<C-U><C-R>=printf("Leaderf! rg -e %s ", expand("<cword>"))<CR>
let g:Lf_IgnoreFiles = '\v[\/]\.(git|hg|svn|cache)$'
let g:Lf_DirCacheExcludePattern = '[/\\]?(\\.git|\.hg|\.svn|__pycache__)$'

" preservim/tagbar
map <leader>m :TagbarToggle<CR>

" ludovicchabant/vim-gutentags
let g:gutentags_cache_dir = "~/.cache/tags"
let g:gutentags_modules = ['ctags']
let g:gutentags_incremental = 1

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

set encoding=utf-8
" Some servers have issues with backup files, see #649
set nobackup
set nowritebackup

" Having longer updatetime (default is 4000 ms = 4s) leads to noticeable
" delays and poor user experience
set updatetime=300

" Always show the signcolumn, otherwise it would shift the text each time
" diagnostics appear/become resolved
set signcolumn=yes

" Use tab for trigger completion with characters ahead and navigate
" NOTE: There's always complete item selected by default, you may want to enable
" no select by `"suggest.noselect": true` in your configuration file
" NOTE: Use command ':verbose imap <tab>' to make sure tab is not mapped by
" other plugin before putting this into your config
inoremap <silent><expr> <TAB>
      \ coc#pum#visible() ? coc#pum#next(1) :
      \ CheckBackspace() ? "\<Tab>" :
      \ coc#refresh()
inoremap <expr><S-TAB> coc#pum#visible() ? coc#pum#prev(1) : "\<C-h>"

" Make <CR> to accept selected completion item or notify coc.nvim to format
" <C-g>u breaks current undo, please make your own choice
inoremap <silent><expr> <CR> coc#pum#visible() ? coc#pum#confirm()
                              \: "\<C-g>u\<CR>\<c-r>=coc#on_enter()\<CR>"

function! CheckBackspace() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

" Use <c-space> to trigger completion
if has('nvim')
  inoremap <silent><expr> <c-space> coc#refresh()
else
  inoremap <silent><expr> <c-@> coc#refresh()
endif


tnoremap <Esc>h <C-w>h
tnoremap <Esc>j <C-w>j
tnoremap <Esc>k <C-w>k
tnoremap <Esc>l <C-w>l

"map <Esc>t :terminal<CR><C-W>J<C-W>10-
" todo alt+n next or create, alt+t toggle, alt+p prev
let g:toggle_terminal_command = 'bash'
let g:toggle_terminal_position = 'below'
function! ToggleTerminal()
    let bufferNum = bufnr('ToggleTerminal')
    if bufferNum == -1 || bufloaded(bufferNum) != 1
        execute g:toggle_terminal_position.' term ++close ++kill=term '.g:toggle_terminal_command
        file ToggleTerminal
    else
        let windowNum = bufwinnr(bufferNum)
        if windowNum == -1
            execute g:toggle_terminal_position.' sbuffer '.bufferNum
        else
            execute windowNum.'wincmd w'
            hide
        endif
    endif
endfunction

nnoremap <silent> <Esc>t :call ToggleTerminal()<CR>
tnoremap <silent> <Esc>t <C-w>:call ToggleTerminal()<CR>
tnoremap <Esc>x <C-\><C-n>:bdelete!<CR>

call project#Init()
nnoremap <Leader>sw :call project#SaveProject()<CR>
nnoremap <Leader>ss :call project#SwitchProject()<CR>
autocmd VimLeave * call project#AutoSaveSession()

" async tasks
let g:asyncrun_open = 6
let g:asyncrun_rootmarks = ['.git', '.svn', '.root', '.project', '.hg']

function! s:lf_task_source(...)
	let rows = asynctasks#source(&columns * 48 / 100)
	let source = []
	for row in rows
		let name = row[0]
		let source += [name . '  ' . row[1] . '  : ' . row[2]]
	endfor
	return source
endfunction


function! s:lf_task_accept(line, arg)
	let pos = stridx(a:line, '<')
	if pos < 0
		return
	endif
	let name = strpart(a:line, 0, pos)
	let name = substitute(name, '^\s*\(.\{-}\)\s*$', '\1', '')
	if name != ''
		exec "AsyncTask " . name
	endif
endfunction

function! s:lf_task_digest(line, mode)
	let pos = stridx(a:line, '<')
	if pos < 0
		return [a:line, 0]
	endif
	let name = strpart(a:line, 0, pos)
	return [name, 0]
endfunction

function! s:lf_win_init(...)
	setlocal nonumber
	setlocal nowrap
endfunction


let g:Lf_Extensions = get(g:, 'Lf_Extensions', {})
let g:Lf_Extensions.task = {
			\ 'source': string(function('s:lf_task_source'))[10:-3],
			\ 'accept': string(function('s:lf_task_accept'))[10:-3],
			\ 'get_digest': string(function('s:lf_task_digest'))[10:-3],
			\ 'highlights_def': {
			\     'Lf_hl_funcScope': '^\S\+',
			\     'Lf_hl_funcDirname': '^\S\+\s*\zs<.*>\ze\s*:',
			\ },
			\ 'help' : 'navigate available tasks from asynctasks.vim',
		\ }

nnoremap <leader>t :Leaderf --nowrap task<CR>
