#/bin/tclsh

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
catch {exec /usr/local/addons/patcher/bin/patcher-update >@ stdout} result
puts $result
