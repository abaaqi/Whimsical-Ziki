/* Ziki Desk: renders the critters, stats, queue and side rail, and handles the nods. */
(function () {
  'use strict';

  // ---------- Critters (agent avatars) ----------
  function critter(fill, kind, size) {
    var back = '', hat = '', goggles = '', monocle = '', mic = '';
    if (kind === 'logo') back = '<path d="M18 13 15 5"/><path d="M30 13 33 5"/><circle cx="15" cy="4.5" r="3" fill="#FFD84D"/><circle cx="33" cy="4.5" r="3" fill="#9FD8FF"/>';
    if (kind === 'triager') back = '<path d="M17 14.5 24 1.5l7 13z" fill="#C7B6FF"/><circle cx="24" cy="2" r="2.4" fill="#FF7B47"/>';
    if (kind === 'dispatcher') {
      back = '<path d="M10 27a14 14 0 0 1 28 0"/>';
      mic = '<rect x="7" y="25" width="5" height="9" rx="2.5" fill="#FF7B47"/><path d="M9.5 34c0 4 3 6 7 6"/><circle cx="17.5" cy="40" r="1.6" fill="#1C1838" stroke="none"/>';
    }
    if (kind === 'contributor') hat = '<path d="M12.5 19a11.5 9 0 0 1 23 0z" fill="#FFD84D"/><path d="M10 19.5h28"/><path d="M24 10v4"/>';
    if (kind === 'tester') goggles = '<path d="M9.5 26h29"/><rect x="14" y="21" width="9" height="9" rx="4" fill="#E8F7FF"/><rect x="25" y="21" width="9" height="9" rx="4" fill="#E8F7FF"/>';
    if (kind === 'reviewer') monocle = '<circle cx="29" cy="26" r="6.2" stroke-width="2"/><path d="M34.5 29.5c2 2.5 2.5 6 1 9" stroke-width="1.4" stroke-dasharray="1.5 2.2"/>';
    return '<svg class="critter" width="' + size + '" height="' + size + '" viewBox="0 0 48 48" fill="none" stroke="#1C1838" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      back +
      '<path d="M9 31c0-11 6.7-19 15-19s15 8 15 19c0 8-6.3 12-15 12S9 39 9 31z" fill="' + fill + '"/>' +
      hat + goggles +
      '<circle cx="19" cy="26" r="3.6" fill="#FFFFFF" stroke-width="1.8"/><circle cx="29" cy="26" r="3.6" fill="#FFFFFF" stroke-width="1.8"/>' +
      '<circle cx="19.8" cy="26.6" r="1.6" fill="#1C1838" stroke="none"/><circle cx="29.8" cy="26.6" r="1.6" fill="#1C1838" stroke="none"/>' +
      monocle +
      '<ellipse cx="14.5" cy="31.5" rx="2.4" ry="1.5" fill="#FF9EB5" stroke="none"/><ellipse cx="33.5" cy="31.5" rx="2.4" ry="1.5" fill="#FF9EB5" stroke="none"/>' +
      '<path d="M21 33.5q3 3 6 0" stroke-width="2"/>' +
      mic + '</svg>';
  }

  function hydrateCritters(root) {
    (root || document).querySelectorAll('[data-critter]').forEach(function (el) {
      el.outerHTML = critter(el.dataset.fill || '#FFB199', el.dataset.critter, Number(el.dataset.size) || 36);
    });
  }

  var $ = function (sel) { return document.querySelector(sel); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // ---------- Stats ----------
  var ICONS = {
    egg: '<path d="M12 3c3.5 0 6.5 5.5 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8.5 8.5 3 12 3z"/><path d="m8.5 13 2 1.5 2-2 2 1.5"/>',
    plane: '<path d="M21 3 3 10.5l7 2.5 2.5 7.5z"/><path d="M10 13 21 3"/>',
    glass: '<path d="M7 3h10M7 21h10"/><path d="M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'
  };
  var STATS = [
    { id: 'hatched', icon: 'egg', tone: 'sky', label: 'Issues hatched', value: '24', delta: '+3', trend: 'up 3 on yesterday', color: '#2F7DF6', h: [1,2,1,3,2,2,4,1,2,3,1,2,3,2,4,3,2,3] },
    { id: 'claims', icon: 'plane', tone: 'mint', label: 'Claims in flight', value: '6', delta: '+2', trend: 'up 2 on yesterday', color: '#12A37A', h: [0,1,1,2,1,0,2,3,1,2,2,1,0,2,3,2,1,2] },
    { id: 'nod', icon: 'glass', tone: 'peach', label: 'Waiting on your nod', value: '3', delta: '+1', trend: 'one more than an hour ago', color: '#F2662D', h: [0,0,1,0,2,1,0,1,3,1,0,0,2,1,0,1,2,3], peek: true },
    { id: 'points', icon: 'star', tone: 'lilac', label: 'Points banked this week', value: '2,450', delta: '+1,200', trend: 'up 1,200 since Monday', color: '#7B5CF0', h: [1,1,2,1,2,3,2,1,4,2,1,2,3,4,2,3,4,4] }
  ];

  function beads(heights, color) {
    var out = '';
    heights.forEach(function (h) {
      for (var r = 0; r < 4; r++) out += (4 - r) <= h ? '<span class="bead" style="background:' + color + '"></span>' : '<span class="bead"></span>';
    });
    return out;
  }

  function renderStats() {
    $('#stats').innerHTML = STATS.map(function (s) {
      return '<article class="card stat' + (s.peek ? ' stat--peek' : '') + '" aria-label="' + esc(s.label) + '">' +
        (s.peek ? '<span class="stat__peek">' + critter('#FFB199', 'dispatcher', 44) + '</span>' : '') +
        '<div class="stat__label"><span class="tile tile--' + s.tone + '"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[s.icon] + '</svg></span>' + esc(s.label) + '</div>' +
        '<div class="stat__value"><span class="stat__num" data-stat="' + s.id + '">' + esc(s.value) + '</span>' +
        '<span class="delta tile--' + s.tone + '"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>' + esc(s.delta) + '<span class="sr">, ' + esc(s.trend) + '</span></span></div>' +
        '<div class="beads" aria-hidden="true">' + beads(s.h, s.color) + '</div>' +
        '</article>';
    }).join('');
  }

  // ---------- Queue ----------
  var STEPS = ['Report', 'Confirm', 'Authorize', 'Deliver', 'Prove', 'Merge'];
  var ROWS = [
    { id: 'ZED-412', time: '09:05', est: '30 min plan', title: 'Login spinner never stops on slow 3G', repo: 'zedu-fe', agent: 'Azed_Cont', role: 'Contributor', fill: '#FFD84D', kind: 'contributor', stage: 2, status: 'Waiting on your nod', tone: 'nod', action: 'Approve bid', approvable: true, tabs: ['next'] },
    { id: 'ZED-398', time: '09:20', est: 'dup check', title: 'Reactions vanish after a refresh', repo: 'zedu-mobile', agent: 'Azed_Tri', role: 'Triager', fill: '#C7B6FF', kind: 'triager', stage: 1, status: 'Sniffing for duplicates', tone: 'busy', action: 'Peek', tabs: ['next', 'review'] },
    { id: 'ZED-405', time: '09:40', est: '2 verdicts', title: 'Desktop badge stuck at 99+', repo: 'zedu-desktop', agent: 'Azed_Rev', role: 'Reviewer', fill: '#9FD8FF', kind: 'reviewer', stage: 1, status: '1 of 2 verdicts in', tone: 'busy', action: 'Read verdict', tabs: ['next', 'review'] },
    { id: 'ZED-377', time: '10:15', est: 'PR #219', title: 'Invite link 404s for new members', repo: 'zedu-fe', agent: 'Azed_Cont', role: 'Contributor', fill: '#FFD84D', kind: 'contributor', stage: 3, status: 'Pull request linked', tone: 'good', action: 'View PR', tabs: ['next'] },
    { id: 'ZIKI-88', time: '10:40', est: '45 min plan', title: 'Ledger double-counts withdrawn verdicts', repo: 'ziki', agent: 'Agent 007', role: 'Contributor', fill: '#A8F0C6', kind: 'tester', stage: 2, status: 'Waiting on your nod', tone: 'nod', action: 'Approve bid', approvable: true, tabs: ['next'] },
    { id: 'ZED-430', time: '11:00', est: '+1,200 pts', title: 'Voice notes fail over 2 MB', repo: 'zedu-mobile', open: true, agent: 'Up for grabs', role: 'Needs a solver', stage: 2, status: 'Offer closes in 18 min', tone: 'open', action: 'Send a critter', tabs: ['next'] },
    { id: 'ZED-421', time: '11:30', est: 'hand-off', title: 'Typing dots flicker in threads', repo: 'zedu-fe', agent: 'Azed_Disp', role: 'Dispatcher', fill: '#FFB199', kind: 'dispatcher', stage: 2, status: 'Waiting on your nod', tone: 'nod', action: 'Approve', approvable: true, tabs: ['next'] },
    { id: 'ZED-359', time: '12:10', est: '2 testers', title: 'Pinned messages jump on scroll', repo: 'zedu-desktop', agent: 'Azed_Rev', role: 'Reviewer', fill: '#9FD8FF', kind: 'reviewer', stage: 4, status: 'Testers reproducing', tone: 'busy', action: 'Watch', tabs: ['next', 'review'] },
    { id: 'ZED-366', time: 'Tue', est: '+1,200 pts', title: 'Settings toggle ignores dark mode', repo: 'zedu-mobile', agent: 'Azed_Cont', role: 'Solver', fill: '#FFD84D', kind: 'contributor', stage: 6, status: 'Merged · points banked', tone: 'good', action: 'View ledger', tabs: ['merged'] },
    { id: 'ZIKI-71', time: 'Tue', est: '+300 pts', title: 'Verdict form loses its draft', repo: 'ziki', agent: 'Azed_Rev', role: 'Reviewer', fill: '#9FD8FF', kind: 'reviewer', stage: 6, status: 'Merged · verdict counted', tone: 'good', action: 'View ledger', tabs: ['merged'] }
  ];
  var TABS = [['next', 'Up next'], ['you', 'Needs you'], ['review', 'In review'], ['merged', 'Merged']];
  var state = { tab: 'next', query: '', nodded: {}, fresh: null };

  var needsNod = function (r) { return !!(r.approvable && !state.nodded[r.id]); };
  var inTab = function (r, t) { return t === 'you' ? needsNod(r) : r.tabs.indexOf(t) >= 0; };
  var matches = function (r) {
    var q = state.query.trim().toLowerCase();
    if (!q) return true;
    return [r.id, r.title, r.agent, r.repo, r.status, r.role].join(' ').toLowerCase().indexOf(q) >= 0;
  };

  function track(stage) {
    return STEPS.map(function (s, i) {
      var cls = i < stage ? ' is-done' : (i === stage ? ' is-now' : '');
      return '<span class="step' + cls + '"></span>';
    }).join('');
  }

  function rowHtml(r) {
    var nodded = r.approvable && state.nodded[r.id];
    var tone = nodded ? 'good' : r.tone;
    var status = nodded ? 'Bid sent · you nodded' : r.status;
    var stageLabel = r.stage >= 6 ? 'Merged · 6/6' : STEPS[r.stage] + ' · ' + (r.stage + 1) + '/6';
    var who = r.open
      ? '<span class="agent__ghost" aria-hidden="true">?</span>'
      : critter(r.fill, r.kind, 36);
    var btn;
    if (needsNod(r)) btn = '<button class="btn btn--row btn--primary" type="button" data-approve="' + r.id + '">' + esc(r.action) + '<span class="sr"> for ' + r.id + '</span></button>';
    else if (nodded) btn = '<button class="btn btn--row btn--done" type="button" disabled>Nodded<span class="sr"> for ' + r.id + '</span></button>';
    else btn = '<button class="btn btn--row" type="button" data-demo="' + r.id + '">' + esc(r.action) + '<span class="sr"> for ' + r.id + '</span></button>';
    return '<tr' + (state.fresh === r.id ? ' class="is-fresh"' : '') + '>' +
      '<td><span class="when"><b>' + esc(r.time) + '</b><span class="sub">' + esc(r.est) + '</span></span></td>' +
      '<td><span class="issue"><strong>' + esc(r.title) + '</strong><span class="mono">' + r.id + ' · ' + esc(r.repo) + '</span></span></td>' +
      '<td><span class="agent">' + who + '<span class="agent__text"><strong>' + esc(r.agent) + '</strong><span class="sub">' + esc(r.role) + '</span></span></span></td>' +
      '<td><span class="stage"><span class="track" aria-hidden="true">' + track(r.stage) + '</span><span class="stage__label">' + stageLabel + '</span></span></td>' +
      '<td><span class="pill pill--' + tone + '">' + esc(status) + '</span></td>' +
      '<td>' + btn + '</td></tr>';
  }

  function renderQueue() {
    var visible = ROWS.filter(matches);
    $('#tabs').innerHTML = TABS.map(function (t) {
      var n = visible.filter(function (r) { return inTab(r, t[0]); }).length;
      return '<button class="tab" type="button" data-tab="' + t[0] + '" aria-pressed="' + (state.tab === t[0]) + '">' + t[1] + '<span class="tab__count">' + n + '</span></button>';
    }).join('');

    var rows = visible.filter(function (r) { return inTab(r, state.tab); });
    $('#rows').innerHTML = rows.map(rowHtml).join('');

    var empty = $('#empty');
    empty.hidden = rows.length > 0;
    if (!rows.length) {
      if (state.query.trim()) {
        $('#empty-title').textContent = 'No issues match “' + state.query.trim() + '”.';
        $('#empty-body').textContent = 'Try an ID like ZED-412 or an agent name like Azed_Rev.';
      } else {
        $('#empty-title').textContent = 'All caught up.';
        $('#empty-body').textContent = state.tab === 'you' ? 'Every bid has your nod. Your crew is off building.' : 'Nothing here right now.';
      }
    }
    $('#shown').textContent = 'Showing ' + rows.length + ' · 24 issues hatched today';
    state.fresh = null;
    renderNodCount();
  }

  function renderNodCount() {
    var n = ROWS.filter(needsNod).length;
    document.querySelectorAll('[data-nod-count]').forEach(function (el) {
      el.textContent = n;
      el.classList.toggle('is-zero', n === 0);
    });
    var stat = document.querySelector('[data-stat="nod"]');
    if (stat) stat.textContent = n;
    var phrase = document.querySelector('[data-nod-phrase]');
    if (phrase) phrase.textContent = n === 0 ? 'every bid has your nod' : n + (n === 1 ? ' bid' : ' bids') + ' waiting on your nod';
    var todo = document.querySelector('[data-nod-todo]');
    if (todo) todo.textContent = n === 0 ? 'No bid plans waiting' : 'Nod on ' + n + (n === 1 ? ' bid plan' : ' bid plans');
  }

  // ---------- Side rail ----------
  function renderHours() {
    var labels = ['8', '9', '10', '11', '12', '1', '2', '3', '4'];
    var counts = [3, 5, 7, 4, 0, 0, 0, 0, 0];
    var now = 3;
    $('#hours').innerHTML = labels.map(function (label, i) {
      var dots = '';
      for (var k = 0; k < 7; k++) {
        var c = k < counts[i] ? (i === now ? '#F2662D' : '#2F7DF6') : '#E3E1F5';
        dots += '<span class="bead" style="background:' + c + '"></span>';
      }
      return '<div class="hour' + (i === now ? ' is-now' : '') + '"><div class="hour__dots">' + dots + '</div><span class="hour__label">' + label + '</span></div>';
    }).join('');
  }

  var CREW = [
    { who: 'Azed_Cont', role: 'Contributor · Zedu', fill: '#FFD84D', kind: 'contributor', doing: 'On ZED-377', tone: 'good' },
    { who: 'Azed_Rev', role: 'Reviewer · Zedu', fill: '#9FD8FF', kind: 'reviewer', doing: 'Reviewing', tone: 'good' },
    { who: 'Azed_Tri', role: 'Triager · Zedu', fill: '#C7B6FF', kind: 'triager', doing: 'Triaging', tone: 'good' },
    { who: 'Azed_Disp', role: 'Dispatcher · Zedu', fill: '#FFB199', kind: 'dispatcher', doing: 'Routing', tone: 'good' },
    { who: 'Agent 007', role: 'Contributor · Ziki', fill: '#A8F0C6', kind: 'tester', doing: 'Needs nod', tone: 'nod' },
    { who: 'Azik_Tri', role: 'Triager · Zedu', fill: '#E3E1F5', kind: 'triager', doing: 'Napping', tone: 'busy', nap: true }
  ];

  function renderCrew() {
    $('#crew').innerHTML = CREW.map(function (a) {
      return '<li' + (a.nap ? ' class="is-napping"' : '') + '>' + critter(a.fill, a.kind, 34) +
        '<span class="crew__text"><strong>' + esc(a.who) + '</strong><span class="sub">' + esc(a.role) + '</span></span>' +
        '<span class="pill pill--' + a.tone + '" data-crew="' + esc(a.who) + '">' + esc(a.doing) + '</span></li>';
    }).join('');
  }

  // ---------- Toast ----------
  var toastTimer;
  function toast(html) {
    var t = $('#toast');
    t.innerHTML = html;
    void t.offsetWidth;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2800);
  }

  // ---------- Events ----------
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab]');
    if (tab) { state.tab = tab.dataset.tab; renderQueue(); return; }

    var ok = e.target.closest('[data-approve]');
    if (ok) {
      var row = ROWS.filter(function (r) { return r.id === ok.dataset.approve; })[0];
      state.nodded[row.id] = true;
      state.fresh = row.id;
      renderQueue();
      if (row.agent === 'Agent 007') {
        var pill = document.querySelector('[data-crew="Agent 007"]');
        if (pill) { pill.textContent = 'On ' + row.id; pill.className = 'pill pill--good'; }
      }
      toast(critter(row.fill, row.kind, 36) + '<span>Nod sent. ' + esc(row.agent) + ' is on ' + row.id + '.</span>');
      return;
    }

    var demo = e.target.closest('[data-demo]');
    if (demo) {
      toast(critter('#C7B6FF', 'logo', 32) + '<span>Demo desk: on Ziki this opens ' + demo.dataset.demo + '.</span>');
      return;
    }

    var dead = e.target.closest('a[href="#"]');
    if (dead) e.preventDefault();
  });

  function onSearch(e) {
    state.query = e.target.value;
    ['#nav-search', '#queue-search'].forEach(function (sel) {
      var el = $(sel);
      if (el !== e.target) el.value = state.query;
    });
    renderQueue();
  }
  $('#nav-search').addEventListener('input', onSearch);
  $('#queue-search').addEventListener('input', onSearch);

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      var target = window.matchMedia('(max-width: 760px)').matches ? '#queue-search' : '#nav-search';
      $(target).focus();
    }
  });

  // ---------- Boot ----------
  hydrateCritters();
  renderStats();
  renderHours();
  renderCrew();
  renderQueue();
})();
