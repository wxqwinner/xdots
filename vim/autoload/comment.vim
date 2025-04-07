" ~/.vim/autoload/comment.vim

" Configuration defaults
let g:comment_author = get(g:, 'comment_author', $USER)
let g:comment_date_format = get(g:, 'comment_date_format', '%Y-%m-%d')

let g:py_header_comment = [
            \ '"""',
            \ '%DESC%.',
            \ '',
            \ '@history',
            \ ' %DATE% %AUTHOR% Created.',
            \ '',
            \ 'Copyright (c) %YEAR% %AUTHOR%.',
            \ '"""',
            \ '',
            \ ''
            \]

let g:c_header_comment = [
            \ '/**',
            \ ' * %DESC%.',
            \ ' *',
            \ ' * @history',
            \ ' *  %DATE% %AUTHOR% created.',
            \ ' *',
            \ ' * Copyright (c) %YEAR% %AUTHOR%',
            \ ' */',
            \ '',
            \ ''
            \]

let g:py_function_comment = [
            \ '"""%DESC%',
            \ '',
            \ 'Args',
            \ '    name <type> (shape) [io] desc.',
            \ '    name <type> (shape) [io] desc (0, 10].',
            \ '    name <type> (shape) [io] desc {value: desc, value: desc}.',
            \ '',
            \ 'Returns',
            \ '    <type>: desc',
            \ '"""',
            \ ''
            \]

let g:c_function_comment = [
            \ '/**',
            \ ' * %DESC%',
            \ ' *',
            \ ' * @param name <type> (shape) [io] desc.',
            \ ' * @param name <type> (shape) [io] desc (0, 10].',
            \ ' * @param name <type> (shape) [io] desc {value: desc, value: desc}.',
            \ ' * @return <type> desc.',
            \ ' */',
            \ ''
            \]

function! s:GetHeaderCommentTemplate()
    if &filetype == 'python'
        return g:py_header_comment
    elseif index(['c', 'cpp'], &filetype) >= 0
        return g:c_header_comment
    else
        return []
    endif
endfunction

function! s:GetFunctionCommentTemplate()
    if &filetype == 'python'
        return g:py_function_comment
    elseif index(['c', 'cpp'], &filetype) >= 0
        return g:c_function_comment
    else
        return []
    endif
endfunction

function! comment#InsertHeaderComment()
    let template = s:GetHeaderCommentTemplate()
    if empty(template)
        echo 'No template defined for this file type.'
        return
    endif

    let desc = input('Header description: ')
    if desc == ''
        return
    endif

    let date = strftime(g:comment_date_format)
    let year = strftime('%Y')
    let lines = map(copy(template), {_, line ->
        \ substitute(line, '%DESC%', desc, 'g')})
    let lines = map(lines, {_, line ->
        \ substitute(line, '%AUTHOR%', g:comment_author, 'g')})
    let lines = map(lines, {_, line ->
        \ substitute(line, '%DATE%', date, 'g')})
    let lines = map(lines, {_, line ->
        \ substitute(line, '%YEAR%', year, 'g')})

    call append(0, lines)
endfunction


function! comment#InsertFunctionComment()
    let template = s:GetFunctionCommentTemplate()
    if empty(template)
        echo 'No function comment template defined for this file type.'
        return
    endif

    let desc = input('Function description: ')

    let template = substitute(join(template, "\n"), '%DESC%', desc, 'g')
    if &filetype == 'python'
        let indent = matchstr(getline('.'), '^[ \t]*')
        let template_lines = split(template, "\n")
        let template_lines = map(template_lines, 'v:val == "" ? v:val : indent . v:val')
        let template = join(template_lines, "\n")
        call append(line('.'), template_lines)
    else
        call append(line('.') - 1, split(template, "\n"))
    endif
endfunction

" Example mappings (user can add to their vimrc):
" nnoremap <leader>ch :call <SID>InsertHeaderComment()<CR>
" nnoremap <leader>cf :call <SID>InsertFunctionComment()<CR>
