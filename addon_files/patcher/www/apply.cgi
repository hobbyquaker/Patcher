#/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"

catch {exec /usr/local/addons/patcher/bin/patcher-patch $repo/$name >@ stdout} result
puts $result
