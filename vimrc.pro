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

let NERDTreeCreatePrefix='silent keepalt keepjumps'
let NERDTreeRespectWildIgnore=1
let g:project_manager_dir = expand('~/.vim/sessions')
let g:project_manager_projects = {}
let g:project_manager_config = expand('~/.vim/projects.json')

if !isdirectory(g:project_manager_dir)
    call mkdir(g:project_manager_dir, 'p')
endif

if filereadable(g:project_manager_config)
    let g:project_manager_projects = json_decode(join(readfile(g:project_manager_config)))
endif

set sessionoptions+=globals
set sessionoptions-=blank

function! s:GetProjectName() abort
    let l:root = getcwd()
    return fnamemodify(l:root, ':t')
endfunction

function! s:SaveProject() abort
    let l:project_name = s:GetProjectName()
    let l:session_file = printf('%s/%s.session', g:project_manager_dir, substitute(l:project_name, '\s', '_', 'g'))

    execute 'mksession!' l:session_file

    let g:project_manager_projects[l:project_name] = {
                \ 'path': getcwd(),
                \ 'session': l:session_file,
                \ 'timestamp': strftime('%Y-%m-%d %H:%M:%S')
                \ }

    call writefile([json_encode(g:project_manager_projects)], g:project_manager_config)
    echo 'Project saved:' l:project_name
endfunction

function! s:SwitchProject() abort
    let l:current = filter(items(g:project_manager_projects), {_,v -> v[1].path == getcwd()})
    if !empty(l:current)
        call s:SaveProject()
    endif

    let l:project_list = ['Select a project:']
    let l:index = 0
    for [l:name, l:info] in items(g:project_manager_projects)
        let l:index += 1
        call add(l:project_list, printf('%d. %s (%s)', l:index, l:name, l:info.path))
    endfor

    let l:choice = inputlist(l:project_list)
    if l:choice < 1 || l:choice > len(g:project_manager_projects)
        echo 'No project selected.'
        return
    endif

    let l:project_name = keys(g:project_manager_projects)[l:choice - 1]
    call s:LoadProject(l:project_name)
endfunction

function! s:LoadProject(name) abort
    let l:project = g:project_manager_projects[a:name]

    silent! %bwipeout!
    silent! tabonly

    if exists(':NERDTreeClose')
        NERDTreeClose
    endif

    if filereadable(l:project.session)
        execute 'source' l:project.session
        execute 'lcd' l:project.path
        if exists(':NERDTree')
            if bufexists('NERD_tree_1')
                silent! execute 'bwipeout NERD_tree_1'
            endif

            NERDTreeCWD
            wincmd p
        endif
        source ~/.vimrc
        echo 'Project loaded:' a:name
    else
        echoerr 'Session file missing!'
    endif
endfunction

nnoremap <Leader>sw :call <SID>SaveProject()<CR>
nnoremap <Leader>ss :call <SID>SwitchProject()<CR>

autocmd VimLeave * call s:AutoSaveSession()
function! s:AutoSaveSession() abort
    let l:current = filter(items(g:project_manager_projects), {_,v -> v[1].path == getcwd()})
    if !empty(l:current)
        call s:SaveProject()
    endif
endfunction
