$(function () {
    $('#sound-control button').click(function () {
        $('#sound-control button').removeClass('active');
        $(this).addClass('active');
    });

    $('.jumbotron').on('click', 'a.answer', function () {
        var selected = $(this);
        if (selected.attr('disabled') === undefined) {
            $('a.answer').attr('disabled', 'disabled');

            waitAnswer(selected);
            $.post('/save', { question: $("h1.question").attr('id'), answer: $(this).text() }, function (result) {
                showAnswer(result, selected);
            });

        }
        return false;
    });

    getQuestion();
    timer();
});

var answerTimeout = null;
var blinkCount = 0;
var blinkSpeed = 300;
function showAnswer(result, btn) {
    if (blinkCount > 6) {
        blinkCount = 0; blinkSpeed = 300;
        window.clearTimeout(answerTimeout);

        btn.removeClass('btn-info');
        if (result.Correct) {
            btn.addClass('btn-success');
            correct++;
            playSound('correct');
        } else {
            btn.addClass('btn-danger');
            $('a.answer[rel=\'' + result.RightAnswer + '\']').addClass('btn-success');
            wrong++;
            playSound('wrong');
        }

        updateCounts();
        window.setTimeout(getQuestion, 1500);
    } else {
        window.setTimeout(function () { showAnswer(result, btn); }, 200);
    }
}

function playSound(sound) {
    if ($('#sound-control button.active').val() == '0') return;
    $("#audio-" + sound).trigger('play');
}

function waitAnswer(btn) {
    blinkCount++;

    if (btn.hasClass('btn-info')) {
        btn.removeClass('btn-info');
    } else {
        btn.addClass('btn-info');
    }

    answerTimeout = window.setTimeout(function () { waitAnswer(btn); }, blinkSpeed);
    if (blinkSpeed > 0) blinkSpeed -= 50;
}

function getQuestion() {
    $('.jumbotron').fadeOut(function () {
        $('.jumbotron').empty();
        $('#pleasewait').fadeIn(function () {
            $.get('/get', function (question) {
                $('<h1/>').addClass('question').attr('id', question.wordId).text(question.word).appendTo($('.jumbotron'));
                $('<p/>').addClass('lead').text('ne anlama gelir?').appendTo($('.jumbotron'));
                $.each(question.answers, function (i, answer) {
                    $('<a/>').addClass('btn btn-large answer').attr({ 'href': '#', 'rel': answer }).text(answer).appendTo($('<span/>').appendTo('.jumbotron'))
                });

                $('#pleasewait').fadeOut(function () {
                    $('.jumbotron').fadeIn();
                });
            });
        });
    });
}

var gameTime = 0;
var correct = 0;
var wrong = 0;
function timer() {
    $(".gametime").html(convertSeconds(gameTime, 'sn.', 'dk.', 'sa.'));

    gameTime++;
    window.setTimeout(timer, 1000);
}

function updateCounts() {
    $(".badge-success").html(correct);
    $(".badge-important").html(wrong);

    var percent = Math.floor((100.0 / (correct + wrong)) * correct);
    $(".badge-info").html('%' + percent);
}

function convertSeconds(seconds, langSecs, langMins, langHours) {
    if (seconds < 60) { // dakikadan küçükse
        nTime = seconds + ' ' + langSecs;
    } else if (seconds > 59 && seconds < 3600) { //dakikadan byk saatten kkse
        nTime = Math.floor(seconds / 60) + ' ' + langMins
        if ((Math.floor(seconds / 60) * 60) < seconds) { // saniye ksr var
            nTime += ' ' + (seconds - Math.floor(seconds / 60) * 60) + ' ' + langSecs;
        }
    } else { // saatse

        nTime = Math.floor(seconds / 3600) + ' ' + ' ' + langHours;

        if ((Math.floor(seconds / 3600) * 3600) < seconds) { // saniye küsür var belkide dakika
            var precision = seconds - (Math.floor(seconds / 3600) * 3600);

            if (precision > 59) { // demekki dakika var
                nTime += ' ' + Math.floor(precision / 60) + ' ' + langMins;
            }

            if ((Math.floor(precision / 60) * 60) < precision) { // saniye küsürde var masallah
                nTime += ' ' + (precision - (Math.floor(precision / 60) * 60)) + ' ' + langSecs;
            }
        }
    }
    return nTime;
}