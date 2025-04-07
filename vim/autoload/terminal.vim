" todo alt+n next or create, alt+t toggle, alt+p prev
let g:toggle_terminal_command = 'bash'
let g:toggle_terminal_position = 'below'
function! terminal#ToggleTerminal()
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