const blacklist = [
    'Jens-Maus_RaspberryMatic/0001-RaspberryMatic.patch',
    'Jens-Maus_RaspberryMatic/0003-passwd-SHA512.patch',
    'Jens-Maus_RaspberryMatic/0004-LocalSSLCert.patch',
    'Jens-Maus_RaspberryMatic/0008-WebUI-Disable-ReGa.patch',
    'Jens-Maus_RaspberryMatic/0031-WebUI-Fix-FileUpload.patch',
];

const qs = location.search;
let sid = '';
let tmp = qs.match(/sid=(@[0-9a-zA-Z]{10}@)/);
if (tmp) {
    sid = tmp[1];
}

let patches = [];

$('#alertSuccess').hide();
$('#alertFail').hide();

function alert($elem) {
    $elem.show();
    $elem.addClass('show');
    setTimeout(() => {
        $elem.removeClass('show');
        setTimeout(() => {
            $elem.hide();
        }, 200);
    }, 1600);
}

function getPatches() {
    fetch(`applied.cgi?sid=${sid}`).then(res => res.text()).then(res => {
        const applied = [];
        res.split('\n').forEach(line => {
            if (line) {
                applied.push(line);
            }
        });
        console.log('applied', applied);

        fetch(`patches.cgi?sid=${sid}`).then(res => res.text()).then(res => {
            let repo;
            let match;
            patches = [];
            res.split('\n').forEach(line => {
                match = line.match(/\/usr\/local\/addons\/patcher\/var\/repos\/([^/]+):/);
                if (match) {
                    repo = match[1];
                }
                match = line.match(/\.patch$/);
                if (match) {
                    patches.push({repo, name: line, applied: applied.includes(`${repo}/${line}`)});
                }
            });
            console.log('applied...', applied);
            console.log('patches', patches);

            refresh();
        });
    });
}

function refresh() {
    $('#patches').html('');
    const search = $.trim($('#search').val()).toLowerCase();
    patches.forEach(patch => {
        if (blacklist.includes(`${patch.repo}/${patch.name}`)) {
            return;
        }
        if (
            !search ||
            patch.repo.toLowerCase().includes(search) ||
            patch.name.toLowerCase().includes(search)
        ) {
            $('#patches').append(`<tr><td>${patch.repo.replace('_', '/')}</td><td>${patch.name}</td>
                    <td style="text-align: center;">${patch.applied ? '<i style="font-size: 1.9em; vertical-align: bottom;" class="fas fa-check-square"></i>' : ''}</td>
                    <td>
                        <button data-repo="${patch.repo}" data-name="${patch.name}" type="button" class="patch-view btn btn-primary btn-sm"><i class="fas fa-search-plus"></i> View</button>
                        <button data-repo="${patch.repo}" data-name="${patch.name}" type="button" class="patch-apply btn btn-primary btn-sm" ${patch.applied ? 'disabled' : ''}><i class="fas fa-hammer"></i> Patch</button>
                        <button data-repo="${patch.repo}" data-name="${patch.name}" type="button" class="patch-revert btn btn-primary btn-sm"><i class="fas fa-undo-alt"></i> Revert</button>
                    </td></tr>\n`);
        }
    });
}

getPatches();

function appendSource(url) {
    $('#sourcesList').append(`<div class="row my-2">
            <div class="col-lg-10"><input class="form-control source-url" type="text" value="${url}"></div>
            <div class="col"><button type="button" class="remove-source btn btn-primary"><i class="fas fa-minus"></i></button></div>
            </div>`);
}

$('#search').on('keyup', refresh);
$('#search').on('blur', refresh);
$('#search').on('search', refresh);

$('#update').on('click', () => {
    $('#progress').html('');
    $('#progressModal').modal({keyboard: false, show: true});
    $('#progressClose').attr('disabled', true);
    fetch(`update.cgi?sid=${sid}`).then(res => res.body).then(body => {
        const reader = body.getReader();
        let output = '';
        function read() {
            reader.read().then(r => {
                const text = new TextDecoder('utf-8').decode(r.value);
                output += text;
                $('#progress').text(output);
                $('#progressBody').animate({
                    scrollTop: $('#progressBody').height()
                }, 500);
                if (r.done) {
                    getPatches();
                    $('#progressClose').removeAttr('disabled', true);
                } else {
                    read();
                }
            });
        }
        read();
    });
});

$('#configure').on('click', () => {
    $('#sourcesList').html('');
    fetch(`sources.json?sid=${sid}`).then(res => res.json()).then(res => {
        res.forEach(src => {
            appendSource(src.url);
        });
    });
    $('#configModal').modal('show');
});

$('#appendSource').on('click', () => {
    appendSource('');
});

$(document).on('click', '.remove-source', function () {
    $(this).parent().parent().remove();
});

$('#saveSources').on('click', () => {
    const sources = [];
    $('.source-url').each(function () {
        sources.push({url: $(this).val()});
    });
    fetch(`setsources.cgi?sid=${sid}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sources)
    }).then(res => res.text()).then(res => {
        if (res === 'ok\n') {
            alert($('#alertSuccess'));
        } else {
            alert($('#alertFail'));
        }
        $('#configModal').modal('hide');
    });

});

$(document).on('click', '.patch-view', function () {
    const src = document.querySelector('#src');

    src.classList.remove('hljs');
    src.innerHTML = '';

    const repo = $(this).data('repo');
    const name = $(this).data('name');

    $('#srcTitle').html(`${repo.replace('_', '/')} - ${name}`);

    // Todo fix encoding
    fetch(`repos/${repo}/${name}`).then(res => res.text()).then(res => {
        $('#src').text(res);
        hljs.highlightBlock(src);
        $('#srcModal').modal('show');
    });
});

$(document).on('click', '.patch-apply', function () {
    const repo = $(this).data('repo');
    const name = $(this).data('name');

    $('#progress').html('');
    $('#progressModal').modal({keyboard: false, show: true});
    $('#progressClose').attr('disabled', true);
    fetch(`apply.cgi?sid=${sid}&repo=${repo}&name=${name}`).then(res => res.body).then(body => {
        const reader = body.getReader();
        let output = '';
        function read() {
            reader.read().then(r => {
                const text = new TextDecoder('utf-8').decode(r.value);
                output += text;
                $('#progress').text(output);
                $('#progressBody').animate({
                    scrollTop: $('#progressBody').height()
                }, 500);
                if (r.done) {
                    setTimeout(getPatches, 1000);
                    $('#progressClose').removeAttr('disabled', true);
                } else {
                    read();
                }
            });
        }
        read();
    });
});

$(document).on('click', '.patch-revert', function () {
    const repo = $(this).data('repo');
    const name = $(this).data('name');

    $('#progress').html('');
    $('#progressModal').modal({keyboard: false, show: true});
    $('#progressClose').attr('disabled', true);
    fetch(`revert.cgi?sid=${sid}&repo=${repo}&name=${name}`).then(res => res.body).then(body => {
        const reader = body.getReader();
        let output = '';
        function read() {
            reader.read().then(r => {
                const text = new TextDecoder('utf-8').decode(r.value);
                output += text;
                $('#progress').text(output);
                $('#progressBody').animate({
                    scrollTop: $('#progressBody').height()
                }, 500);
                if (r.done) {
                    setTimeout(getPatches, 1000);
                    $('#progressClose').removeAttr('disabled', true);
                } else {
                    read();
                }
            });
        }
        read();
    });
});