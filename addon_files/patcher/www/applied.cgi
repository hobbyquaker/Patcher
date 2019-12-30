#/bin/tclsh

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
catch {exec cat /usr/local/addons/patcher/var/applied} result
puts $result
