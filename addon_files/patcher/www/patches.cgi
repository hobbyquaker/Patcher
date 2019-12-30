#/bin/tclsh

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
catch {exec ls -1R /usr/local/addons/patcher/var/repos} result
puts $result
