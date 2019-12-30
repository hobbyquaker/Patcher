#/bin/tclsh

source ../lib/querystring.tcl
source ../lib/session.tcl

if {[info exists sid] && [check_session $sid]} {
    puts -nonewline "Content-Type: text/plain; charset=utf-8\r\n\r\n"
    catch {exec cat /usr/local/addons/patcher/var/applied} result
    puts $result
} else {
    puts {error: invalid session}
}