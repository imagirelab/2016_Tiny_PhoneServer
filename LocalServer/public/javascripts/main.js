//var socket = io.connect('https://safe-reef-35714.herokuapp.com/');
var socket = io.connect('ws://192.168.11.250:5555');
//var socket = io.connect('ws://192.168.11.3:5555');
//var socket = io.connect('ws://localhost:5555');

var myPlayerID = 0;

socket.on("connect", function () {
    var id = socket.io.engine.id;
    console.log("Connected ID: " + id);
});

enchant();

window.onload = function ()
{
    var core = new Core(1280, 720);

    //悪魔                       Type   Dir  Level ID   BASECOST COST  HP  ATK  SPEED    
    var defaultPUPU = new Demon("PUPU", "None", 0, null, 100, 100, 150, 250, 3);
    var defaultPOPO = new Demon("POPO", "None", 0, null, 100, 100, 1000, 100, 2);
    var defaultPIPI = new Demon("PIPI", "None", 0, null, 100, 100, 100, 50, 5);

    //悪魔
    var PUPU;
    var POPO;
    var PIPI;

    //自分の初期所持コスト
    var defaulthaveCost = 500;
    var haveCost;

    //最大所持コスト
    var defaultMaxCost = 3000;
    var MaxCost;

    //毎秒取得できるコスト
    var fpsCost = 25;

    //最大ステータス
    var MAXHP = 7000;
    var MAXATK = 1700;
    var MAXSPEED = 5;

    //タッチし始めの場所を確認
    var tapPos = new TapPos();
    //なにをタップしたかの確認
    var tapObj;
    //コストが払えるかのフラグ
    var Flag;
    //タイマー
    var Timer;

    //必殺技を撃ったかのフラグ
    var deadlyFlag;
    //必殺技コスト数
    var deadlyCost = 10;
    //パワーアップのコストが増えるレベルの間隔
    var powerUpInterval = 5;

    //10個までの魂保管用配列
    var spiritsLength = 10;
    var Spirits = new Array(spiritsLength);

    //魂をふよふよさせるために必要な変数
    var degree = 0;

    //キー割り当て(デバッグ用)
    core.keybind(' '.charCodeAt(0), 'summonSpirit');
    core.keybind('a'.charCodeAt(0), 'Main');
    core.keybind('s'.charCodeAt(0), 'Result');
    core.keybind('d'.charCodeAt(0), 'Matching');
    core.keybind('p'.charCodeAt(0), 'Pause');

    //押した時に一回だけ呼ばれるようにするためのフラグ
    var oneCallFlag = false;
    var buttonUpFlag = false;

    var stoppingFlag = false;

    //事前にロードを行う
    //背景
    core.preload('img/back5.png');
    core.preload('matchingUI/sumahoTitle.png');
    core.preload('matchingUI/sumatai_haikei.png');
    core.preload('matchingUI/otu.png');

    //ボタン
    core.preload('img/pupu.png');
    core.preload('img/pipi.png');
    core.preload('img/popo.png');
    core.preload('img/pupu2.png');
    core.preload('img/pipi2.png');
    core.preload('img/popo2.png');
    core.preload('img/ya_blue.png');
    core.preload('img/ya_green.png');
    core.preload('img/ya_red.png');
    core.preload('img/deadly.png');
    core.preload('img/deadly2.png');
    core.preload('img/deadly3.png');

    //UI・フォント
    core.preload('img/CP.png');
    core.preload('img/rednumber_siro.png');
    core.preload('img/blacknumber.png');
    core.preload('img/huki_blue.png');
    core.preload('img/huki_green.png');
    core.preload('img/huki_red.png');
    core.preload('img/kama_soul.png');
    core.preload('matchingUI/game_end_tap.png');
    core.preload('matchingUI/tap_the_screen.png');
    core.preload('matchingUI/title.png');
    core.preload('matchingUI/teamb.png');
    core.preload('matchingUI/teamr.png');
    core.preload('matchingUI/matching.png');
    core.preload('matchingUI/sumahotaiki.png');
    core.preload('img/red.png');
    core.preload('img/blue.png');
    core.preload('img/green.png');
    core.preload('img/barhp.png');
    core.preload('img/barattack.png');
    core.preload('img/barspeed.png');
    core.preload('matchingUI/see_mo.png');
    core.preload('img/kosutoko.png');
    core.preload('img/attack.png');
    core.preload('img/life.png');
    core.preload('img/speed.png');
    core.preload('img/max.png');

    //スピリット
    core.preload('img/pupu_soul.png');
    core.preload('img/popo_soul.png');
    core.preload('img/pipi_soul.png');

    //gif
    core.preload('img/sumahotatti.png');

    //fpsの設定
    core.fps = 24;

    core.onload = function ()
    {
//////////////////////////タイトルシーン//////////////////////////////////////////////////////////////////////////////
        var TitleScene = function ()
        {
            var scene = new Scene();

            //全体の初期化
            PUPU = defaultPUPU;
            POPO = defaultPOPO;
            PIPI = defaultPIPI;

            haveCost = defaulthaveCost;
            MaxCost = defaultMaxCost;

            for (var i = 0; i < spiritsLength; i++)
            {
                Spirits[i] = null;
            }

            oneCallFlag = stoppingFlag = deadlyFlag = buttonUpFlag = false;

            core.frame = 0;
            
            ////////画像情報処理////////
            //背景
            var titleBack = new Sprite(1280, 720);
            titleBack.image = core.assets['matchingUI/sumahoTitle.png'];
            titleBack.scale(1, 1);
            titleBack.x = 0;
            titleBack.y = 0;

            var title = new Sprite(960, 560);
            title.image = core.assets['matchingUI/title.png'];
            title.scale(1, 1);
            title.x = core.width / 2 - title.width / 2;
            title.y = 0;

            var tapRequest = new Sprite(1024, 256);
            tapRequest.image = core.assets['matchingUI/tap_the_screen.png'];
            tapRequest.scale(0.5, 0.5);
            tapRequest.x = core.width / 2 - tapRequest.width / 2;
            tapRequest.y = core.height / 2 + tapRequest.height / 2;

            var PUPUgif = new Sprite(600, 600);
            PUPUgif.image = core.assets['img/sumahotatti.png'];
            PUPUgif.scale(0.5, 0.5);
            PUPUgif.x = core.width - PUPUgif.width * 0.8;
            PUPUgif.y = core.height - PUPUgif.height * 0.8;
            PUPUgif.frame = 0;

            scene.addEventListener('enterframe', function ()
            {
                var radian = Math.PI / 180 * degree;
                tapRequest.y += Math.sin(radian);
                degree += 3;
                PUPUgif.frame = PUPUgif.age % 24;
            });

            ////////メイン処理////////
            scene.addEventListener(Event.TOUCH_START, function ()
            {
                //3秒経過しないと受け付けない
                if (core.frame > core.fps * 1.5)
                {
                    //現在表示しているシーンをゲームシーンに置き換えます
                    //core.replaceScene(MainScene());
                    core.replaceScene(MatchingScene());
                }                
            });            

            ////////描画////////
            scene.addChild(titleBack);
            scene.addChild(title);
            scene.addChild(tapRequest);
            scene.addChild(PUPUgif);

            return scene;
        };

//////////////////////////マッチングシーン//////////////////////////////////////////////////////////////////////////////
        var MatchingScene = function ()
        {
            var scene = new Scene();

            socket.emit("EnterRobby");

            //プレイヤーIDのセット
            socket.on("PushPlayerID", function (idData) {
                myPlayerID = idData.PlayerID;
                console.log("Connect PlayerID: " + myPlayerID);
            });

            var back = new Sprite(1280, 720);
            back.image = core.assets['matchingUI/sumatai_haikei.png'];
            back.scale(1, 1);
            back.x = 0;
            back.y = 0;

            var teamColor = new Sprite(1024, 256);
            teamColor.scale(0.5, 0.5);
            teamColor.x = 500;
            teamColor.y = -50;

            var setumei = new Sprite(512, 512);
            setumei.image = core.assets["matchingUI/sumahotaiki.png"];
            setumei.x = core.width / 2 - setumei.width / 2;
            setumei.y = core.height / 2 - setumei.height / 2;
            setumei.frame = 0;

            var showTime = 0;
            var moveTime = 2;
            var moveFlag = false;

            scene.addEventListener('enterframe', function ()
            {
                if (myPlayerID / 2 == 0) {
                    teamColor.image = core.assets['matchingUI/teamr.png'];
                }
                else {
                    teamColor.image = core.assets['matchingUI/teamb.png'];
                }

                if (!moveFlag) {
                    showTime = core.frame / core.fps;
                    setumei.x -= showTime * showTime;
                }
                else {
                    showTime = core.frame / core.fps - 4.85;
                    setumei.x -= showTime * showTime;
                }

                if (setumei.x + setumei.width < 0) {
                    setumei.x = core.width;
                    core.frame = 0;
                    showTime = core.frame / core.fps - 4.85;
                    moveFlag = true;
                    setumei.frame++;
                }
            });

            socket.on("PushMatchingEnd", function () {
                //現在表示しているシーンをゲームシーンに置き換えます
                core.replaceScene(MainScene());
            });

            scene.addChild(back);
            scene.addChild(teamColor);
            scene.addChild(setumei);

            return scene;
        };

//////////////////////////メインシーン//////////////////////////////////////////////////////////////////////////////
        var MainScene = function ()
        {
            var scene = new Scene();

            //フレームリセット
            core.frame = 0;

            //全体の初期化
            PUPU = InitializeDemon(PUPU, defaultPUPU);
            POPO = InitializeDemon(POPO, defaultPOPO);
            PIPI = InitializeDemon(PIPI, defaultPIPI);

            haveCost = InitializeCost(haveCost, defaulthaveCost);
            MaxCost = InitializeMaxCost(MaxCost, defaultMaxCost);

            for (var i = 0; i < spiritsLength; i++) {
                Spirits[i] = null;
            }

            oneCallFlag = stoppingFlag = deadlyFlag = buttonUpFlag = false;

            var FPSlbl = new Label();
            FPSlbl.font = "italic 36px 'ＭＳ 明朝', 'ＭＳ ゴシック', 'Times New Roman', serif, sans-serif";

            ////////画像情報処理////////
            {
                //ププのボタン
                var pupuBtn = new Sprite(1200, 1200);
                pupuBtn.image = core.assets['img/pupu.png'];
                pupuBtn.scale(0.1, 0.1);
                pupuBtn.x = 500;
                pupuBtn.y = -480;

                //ポポのボタン
                var popoBtn = new Sprite(1200, 1200);
                popoBtn.image = core.assets['img/popo.png'];
                popoBtn.scale(0.1, 0.1);
                popoBtn.x = 500;
                popoBtn.y = -250;

                //ピピのボタン
                var pipiBtn = new Sprite(1200, 1200);
                pipiBtn.image = core.assets['img/pipi.png'];
                pipiBtn.scale(0.1, 0.1);
                pipiBtn.x = 500;
                pipiBtn.y = -20;

                //必殺技のボタン
                var deadlyBtn = new Sprite(239, 140);
                deadlyBtn.image = core.assets['img/deadly.png'];
                deadlyBtn.scale(1, 1);
                deadlyBtn.opacity = 0;
                deadlyBtn.x = 175;
                deadlyBtn.y = 0;

                //背景
                var back = new Sprite(3200, 1800);
                back.image = core.assets['img/back5.png'];
                back.x = 0;
                back.y = 0;

                //UI
                //ププのUI背景
                var PUPU_UI = new Sprite(600, 600);
                PUPU_UI.image = core.assets['img/huki_red.png'];
                PUPU_UI.scale(0.6, 0.55);
                PUPU_UI.x = 500;
                PUPU_UI.y = -175;

                //ポポのUI背景
                var POPO_UI = new Sprite(600, 600);
                POPO_UI.image = core.assets['img/huki_green.png'];
                POPO_UI.scale(0.6, 0.55);
                POPO_UI.x = 500;
                POPO_UI.y = 60;

                //ピピのUI背景
                var PIPI_UI = new Sprite(600, 600);
                PIPI_UI.image = core.assets['img/huki_blue.png'];
                PIPI_UI.scale(0.6, 0.55);
                PIPI_UI.x = 500;
                PIPI_UI.y = 295;

                //ポンプ本体
                var ponpu = new Sprite(600, 400);
                ponpu.image = core.assets['img/kama_soul.png'];
                ponpu.scale(1, 1);
                ponpu.x = 0;
                ponpu.y = 200;

                //最大と表示するためのUI
                var MaxSpirit = new Sprite(256, 256);
                MaxSpirit.image = core.assets['img/max.png'];
                MaxSpirit.scale(1, 1);
                MaxSpirit.x = 175;
                MaxSpirit.y = 300;
                MaxSpirit.opacity = 0.0;

                //矢印
                var Arrow = new Sprite(600, 600);
                Arrow.image = core.assets['img/ya_blue.png'];
                Arrow.scale(0.2, 0.2);
                Arrow.x = 9999;
                Arrow.y = 9999;

                //CPのフォント
                var CPFont = new Sprite(150, 150);
                CPFont.image = core.assets['img/CP.png'];
                CPFont.scale(0.7, 0.7);
                CPFont.x = 400;
                CPFont.y = 600;

                //所持コストのフォント
                var costFont = new Array();
                var costDigit = 4;  //桁数(初期設定4桁)
                for (var i = 0; i < costDigit; i++) {
                    costFont[i] = new Sprite(120, 120);
                    costFont[i].image = core.assets['img/rednumber_siro.png'];
                    costFont[i].scale(2, 2);
                    costFont[i].x = 400 - (i + 1) * 75;
                    costFont[i].y = 600;
                    costFont[i].frame = 0;
                }

                //デーモンに必要なコストのフォント
                var DemoncostDigit = 3;  //桁数(初期設定3桁)

                var PUPUcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    PUPUcostFont[i] = new Sprite(120, 120);
                    PUPUcostFont[i].image = core.assets['img/blacknumber.png'];
                    PUPUcostFont[i].scale(1, 1);
                    PUPUcostFont[i].x = 800 - (i + 1) * 40;
                    PUPUcostFont[i].y = 0;
                    PUPUcostFont[i].frame = 0;
                }

                var POPOcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    POPOcostFont[i] = new Sprite(120, 120);
                    POPOcostFont[i].image = core.assets['img/blacknumber.png'];
                    POPOcostFont[i].scale(1, 1);
                    POPOcostFont[i].x = 800 - (i + 1) * 40;
                    POPOcostFont[i].y = 235;
                    POPOcostFont[i].frame = 0;
                }

                var PIPIcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    PIPIcostFont[i] = new Sprite(120, 120);
                    PIPIcostFont[i].image = core.assets['img/blacknumber.png'];
                    PIPIcostFont[i].scale(1, 1);
                    PIPIcostFont[i].x = 800 - (i + 1) * 40;
                    PIPIcostFont[i].y = 470;
                    PIPIcostFont[i].frame = 0;
                }

                var strengthInterval = 3;

                ////////ステータスバー部分//////
                {
                    var PUPUCostFont = new Sprite(150, 150);
                    PUPUCostFont.image = core.assets['img/kosutoko.png'];
                    PUPUCostFont.scale(0.5, 0.5);
                    PUPUCostFont.x = 600;
                    PUPUCostFont.y = -10;

                    var PUPUHP = new Sprite(150, 600);
                    PUPUHP.image = core.assets['img/green.png'];
                    PUPUHP.scale(0.2, 0.5);
                    PUPUHP.x = 600;
                    PUPUHP.y = -500;
                    PUPUHP.originY = PUPUHP.height;
                    PUPUHP.rotate(-90);
                    PUPUHP.frame = 0;

                    var PUPUHPicon = new Sprite(600, 600);
                    PUPUHPicon.image = core.assets['img/life.png'];
                    PUPUHPicon.scale(0.06, 0.06);
                    PUPUHPicon.x = 350;
                    PUPUHPicon.y = -200;
                    PUPUHPicon.frame = 0;

                    var PUPUATK = new Sprite(150, 600);
                    PUPUATK.image = core.assets['img/red.png'];
                    PUPUATK.scale(0.2, 0.5);
                    PUPUATK.x = 600;
                    PUPUATK.y = -450;
                    PUPUATK.originY = PUPUATK.height;
                    PUPUATK.rotate(-90);
                    PUPUATK.frame = 0;

                    var PUPUATKicon = new Sprite(600, 600);
                    PUPUATKicon.image = core.assets['img/attack.png'];
                    PUPUATKicon.scale(0.06, 0.06);
                    PUPUATKicon.x = 350;
                    PUPUATKicon.y = -150;
                    PUPUATKicon.frame = 0;

                    var PUPUSPEED = new Sprite(150, 600);
                    PUPUSPEED.image = core.assets['img/blue.png'];
                    PUPUSPEED.scale(0.2, 0.5);
                    PUPUSPEED.x = 600;
                    PUPUSPEED.y = -400;
                    PUPUSPEED.originY = PUPUSPEED.height;
                    PUPUSPEED.rotate(-90);
                    PUPUSPEED.frame = 0;

                    var PUPUSPEEDicon = new Sprite(600, 600);
                    PUPUSPEEDicon.image = core.assets['img/speed.png'];
                    PUPUSPEEDicon.scale(0.06, 0.06);
                    PUPUSPEEDicon.x = 350;
                    PUPUSPEEDicon.y = -100;
                    PUPUSPEEDicon.frame = 0;


                    var POPOCostFont = new Sprite(150, 150);
                    POPOCostFont.image = core.assets['img/kosutoko.png'];
                    POPOCostFont.scale(0.5, 0.5);
                    POPOCostFont.x = 600;
                    POPOCostFont.y = 225;

                    var POPOHP = new Sprite(150, 600);
                    POPOHP.image = core.assets['img/green.png'];
                    POPOHP.scale(0.2, 0.5);
                    POPOHP.x = 600;
                    POPOHP.y = -265;
                    POPOHP.originY = POPOHP.height;
                    POPOHP.rotate(-90);
                    POPOHP.frame = 0;

                    var POPOHPicon = new Sprite(600, 600);
                    POPOHPicon.image = core.assets['img/life.png'];
                    POPOHPicon.scale(0.06, 0.06);
                    POPOHPicon.x = 350;
                    POPOHPicon.y = 35;
                    POPOHPicon.frame = 0;

                    var POPOATK = new Sprite(150, 600);
                    POPOATK.image = core.assets['img/red.png'];
                    POPOATK.scale(0.2, 0.5);
                    POPOATK.x = 600;
                    POPOATK.y = -215;
                    POPOATK.originY = POPOATK.height;
                    POPOATK.rotate(-90);
                    POPOATK.frame = 0;

                    var POPOATKicon = new Sprite(600, 600);
                    POPOATKicon.image = core.assets['img/attack.png'];
                    POPOATKicon.scale(0.06, 0.06);
                    POPOATKicon.x = 350;
                    POPOATKicon.y = 85;
                    POPOATKicon.frame = 0;

                    var POPOSPEED = new Sprite(150, 600);
                    POPOSPEED.image = core.assets['img/blue.png'];
                    POPOSPEED.scale(0.2, 0.5);
                    POPOSPEED.x = 600;
                    POPOSPEED.y = -165;
                    POPOSPEED.originY = POPOSPEED.height;
                    POPOSPEED.rotate(-90);
                    POPOSPEED.frame = 0;

                    var POPOSPEEDicon = new Sprite(600, 600);
                    POPOSPEEDicon.image = core.assets['img/speed.png'];
                    POPOSPEEDicon.scale(0.06, 0.06);
                    POPOSPEEDicon.x = 350;
                    POPOSPEEDicon.y = 135;
                    POPOSPEEDicon.frame = 0;


                    var PIPICostFont = new Sprite(150, 150);
                    PIPICostFont.image = core.assets['img/kosutoko.png'];
                    PIPICostFont.scale(0.5, 0.5);
                    PIPICostFont.x = 600;
                    PIPICostFont.y = 460;

                    var PIPIHP = new Sprite(150, 600);
                    PIPIHP.image = core.assets['img/green.png'];
                    PIPIHP.scale(0.2, 0.5);
                    PIPIHP.x = 600;
                    PIPIHP.y = -30;
                    PIPIHP.originY = PIPIHP.height;
                    PIPIHP.rotate(-90);
                    PIPIHP.frame = 0;

                    var PIPIHPicon = new Sprite(600, 600);
                    PIPIHPicon.image = core.assets['img/life.png'];
                    PIPIHPicon.scale(0.06, 0.06);
                    PIPIHPicon.x = 350;
                    PIPIHPicon.y = 270;
                    PIPIHPicon.frame = 0;

                    var PIPIATK = new Sprite(150, 600);
                    PIPIATK.image = core.assets['img/red.png'];
                    PIPIATK.scale(0.2, 0.5);
                    PIPIATK.x = 600;
                    PIPIATK.y = 20;
                    PIPIATK.originY = PIPIATK.height;
                    PIPIATK.rotate(-90);
                    PIPIATK.frame = 0;

                    var PIPIATKicon = new Sprite(600, 600);
                    PIPIATKicon.image = core.assets['img/attack.png'];
                    PIPIATKicon.scale(0.06, 0.06);
                    PIPIATKicon.x = 350;
                    PIPIATKicon.y = 320;
                    PIPIATKicon.frame = 0;

                    var PIPISPEED = new Sprite(150, 600);
                    PIPISPEED.image = core.assets['img/blue.png'];
                    PIPISPEED.scale(0.2, 0.5);
                    PIPISPEED.x = 600;
                    PIPISPEED.y = 70;
                    PIPISPEED.originY = PIPISPEED.height;
                    PIPISPEED.rotate(-90);
                    PIPISPEED.frame = 0;

                    var PIPISPEEDicon = new Sprite(600, 600);
                    PIPISPEEDicon.image = core.assets['img/speed.png'];
                    PIPISPEEDicon.scale(0.06, 0.06);
                    PIPISPEEDicon.x = 350;
                    PIPISPEEDicon.y = 370;
                    PIPISPEEDicon.frame = 0;

                    PUPUHP.scaleY = -PUPU.HP * Math.pow(1.1, PUPU.Level) / MAXHP / 2.5;
                    PUPUATK.scaleY = -PUPU.ATK * Math.pow(1.1, PUPU.Level) / MAXATK / 2.5;
                    PUPUSPEED.scaleY = -PUPU.SPEED / MAXSPEED / 2.5;
                    POPOHP.scaleY = -POPO.HP * Math.pow(1.1, POPO.Level) / MAXHP / 2.5;
                    POPOATK.scaleY = -POPO.ATK * Math.pow(1.1, POPO.Level) / MAXATK / 2.5;
                    POPOSPEED.scaleY = -POPO.SPEED / MAXSPEED / 2.5;
                    PIPIHP.scaleY = -PIPI.HP * Math.pow(1.1, PIPI.Level) / MAXHP / 2.5;
                    PIPIATK.scaleY = -PIPI.ATK * Math.pow(1.1, PIPI.Level) / MAXATK / 2.5;
                    PIPISPEED.scaleY = -PIPI.SPEED / MAXSPEED / 2.5;
                }
            }
            ////////メイン処理////////

            //秒間コストを受け取り
            socket.on("PushSecondCost", function (CostData) {
                var intCost = parseInt(CostData.Cost.toString());
                if (haveCost < MaxCost) {
                    haveCost += intCost;
                }
                else {
                    haveCost = MaxCost;
                }
            });

            //倒す・倒された時のコストを受け取り
            socket.on("PushAddCost", function (CostData) {
                var _PlyaerID = parseInt(CostData.PlayerID.toString());
                var intCost = parseInt(CostData.Cost.toString());
                if (_PlyaerID == myPlayerID)
                {
                    if (haveCost < MaxCost) {
                        haveCost += intCost;
                    }
                    else {
                        haveCost = MaxCost;
                    }
                }
            });

            //ポーズ画面へ移動
            socket.on("PushStopRequest", function ()
            {
                if (!stoppingFlag)
                {
                    stoppingFlag = true;
                    core.pushScene(PauseScene());
                }                    
            });

            //ゲーム終了を受け取ってリザルト画面へ移行
            socket.on("PushGameEndRequest", function ()
            {
                core.replaceScene(ResultScene());
            });

            //フレームごとに処理する
            core.addEventListener('enterframe', function ()
            {
                FPSlbl.text = core.actualFps;

                //CPフォント
                for (var i = costDigit - 1; i >= 0; i--) {
                    FontSet(haveCost, i, costFont[i]);
                }

                for (var i = DemoncostDigit - 1; i >= 0; i--) {
                    FontSet(PUPU.Cost, i, PUPUcostFont[i]);
                    FontSet(POPO.Cost, i, POPOcostFont[i]);
                    FontSet(PIPI.Cost, i, PIPIcostFont[i]);
                }

                //スペースボタンを押すと魂が取得できるように
                core.addEventListener('summonSpiritbuttondown', function () {
                    oneCallFlag = true;
                });

                var maxCounter = 0;

                //ポーズボタン
                if (!core.input.up)
                {
                    buttonUpFlag = true;
                }

                if(core.input.up && buttonUpFlag)
                {
                    buttonUpFlag = false;
                    socket.emit("StopRequest");                 
                }

                core.addEventListener('summonSpiritbuttonup', function () {
                    if (oneCallFlag) {
                        socket.emit("SpiritPush", { Type: "PUPU", PlayerID: myPlayerID });
                        oneCallFlag = false;
                    }
                });

                for (var i = 0; i < spiritsLength; i++) {
                    if (Spirits[i] != null) 
                    {
                        var radian = Math.PI / 180 * degree;
                        Spirits[i].Sprite.y += Math.sin(radian) * 0.5;
                    }
                }

                for (var i = 0; i < spiritsLength; i++) {
                    if (Spirits[i] != null) {
                        ++maxCounter;
                    }

                    if (maxCounter == 10) {
                        if (!deadlyFlag)
                        {
                            deadlyBtn.opacity = 1;
                        }
                        scene.addChild(MaxSpirit);
                        MaxSpirit.opacity = 0.8;
                    }
                    else {
                        if (!deadlyFlag)
                        {
                            deadlyBtn.opacity = 0;
                        }
                        else
                        {
                            scene.removeChild(deadlyBtn);
                        }
                        scene.removeChild(MaxSpirit);
                    }
                }                

                degree += 1.5;
            });

            //ボタンが押された時の処理
            pupuBtn.on(Event.TOUCH_START, function () {
                pupuBtn.image = core.assets['img/pupu2.png'];
                tapObj = "pupuBtn";
            });

            popoBtn.on(Event.TOUCH_START, function () {
                popoBtn.image = core.assets['img/popo2.png'];
                tapObj = "popoBtn";
            });

            pipiBtn.on(Event.TOUCH_START, function () {
                pipiBtn.image = core.assets['img/pipi2.png'];
                tapObj = "pipiBtn";
            });

            deadlyBtn.on(Event.TOUCH_START, function () {
                if (!deadlyFlag) {
                    deadlyBtn.image = core.assets['img/deadly2.png'];
                    tapObj = "deadlyBtn";
                }
            });

            //タップした場所の座標取得
            scene.on(Event.TOUCH_START, function (startPos) {
                tapPos.x = startPos.x;
                tapPos.y = startPos.y;
            });

            //離された時の処理
            pupuBtn.on(Event.TOUCH_END, function () {
                pupuBtn.image = core.assets['img/pupu.png'];
            });

            popoBtn.on(Event.TOUCH_END, function () {
                popoBtn.image = core.assets['img/popo.png'];
            });

            pipiBtn.on(Event.TOUCH_END, function () {
                console.log("call");
                pipiBtn.image = core.assets['img/pipi.png'];
            });

            deadlyBtn.on(Event.TOUCH_END, function () {
                if (!deadlyFlag) {
                    //必殺コスト分の魂があるか確認。
                    if (SpiritCheck(Spirits, deadlyCost, spiritsLength)) {
                        deadlyBtn.image = core.assets['img/deadly3.png'];
                        //ここで必殺情報をサーバーに送る
                        PushDeadly(myPlayerID);
                        //コストを最大に回復
                        haveCost = MaxCost;
                        //使用フラグを立てる
                        deadlyFlag = true;
                        //使用した魂の削除
                        Spirits = UsedSpirits(Spirits, deadlyCost, spiritsLength, scene);
                    }
                    else {
                        deadlyBtn.image = core.assets['img/deadly.png'];
                    }
                }
            });

            //タップした場所を使った処理はここから
            scene.on(Event.TOUCH_END, function (endPos) {
                //ププボタンの場所で押してた場合
                if (tapObj == "pupuBtn") {
                    if ((tapPos.y - endPos.y) > pupuBtn.height / 2 * pupuBtn.scaleY) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        haveCost = UseCost(haveCost, PUPU);
                        if (Flag == "Succes")
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.y - endPos.y) < -pupuBtn.height / 2 * pupuBtn.scaleY) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        haveCost = UseCost(haveCost, PUPU);
                        if (Flag == "Succes")
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.x - endPos.x) < -pupuBtn.height / 2 * pupuBtn.scaleX || (tapPos.x - endPos.x) > pupuBtn.height / 2 * pupuBtn.scaleX) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        haveCost = UseCost(haveCost, PUPU);
                        if (Flag == "Succes")
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                    }
                        //パワーアップを選択時
                    else {
                        if (SpiritCheck(Spirits, Math.floor(PUPU.Level / powerUpInterval + 1), spiritsLength) && PUPU.Level < 20) {
                            PowerUp(PUPU);
                            //スケール変更で成長度合いの表現
                            PUPUHP.scaleY = -PUPU.HP * Math.pow(1.1, PUPU.Level) / MAXHP / 2.5;
                            PUPUATK.scaleY = -PUPU.ATK * Math.pow(1.1, PUPU.Level) / MAXATK / 2.5;
                            PUPUSPEED.scaleY = -PUPU.SPEED / MAXSPEED / 2.5;
                            //使用した魂の削除
                            Spirits = UsedSpirits(Spirits, Math.floor(PUPU.Level / powerUpInterval + 1), spiritsLength, scene);
                        }
                    }
                }
                    //ポポボタンの場所で押してた場合
                else if (tapObj == "popoBtn") {
                    if ((tapPos.y - endPos.y) > popoBtn.height / 2 * popoBtn.scaleY) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        haveCost = UseCost(haveCost, POPO);
                        if (Flag == "Succes")
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.y - endPos.y) < -popoBtn.height / 2 * popoBtn.scaleY) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        haveCost = UseCost(haveCost, POPO);
                        if (Flag == "Succes")
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.x - endPos.x) < -popoBtn.height / 2 * popoBtn.scaleX || (tapPos.x - endPos.x) > popoBtn.height / 2 * popoBtn.scaleX) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        haveCost = UseCost(haveCost, POPO);
                        if (Flag == "Succes")
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                    }
                        //パワーアップを選択時
                    else {
                        if (SpiritCheck(Spirits, Math.floor(POPO.Level / powerUpInterval + 1), spiritsLength) && POPO.Level < 20) {
                            PowerUp(POPO);
                            //スケール変更で成長度合いの表現
                            POPOHP.scaleY = -POPO.HP * Math.pow(1.1, POPO.Level) / MAXHP / 2.5;
                            POPOATK.scaleY = -POPO.ATK * Math.pow(1.1, POPO.Level) / MAXATK / 2.5;
                            POPOSPEED.scaleY = -POPO.SPEED / MAXSPEED / 2.5;
                            //使用した魂の削除
                            Spirits = UsedSpirits(Spirits, Math.floor(POPO.Level / powerUpInterval + 1), spiritsLength, scene);
                        }
                    }
                }
                    //ピピボタンの場所で押してた場合
                else if (tapObj == "pipiBtn") {
                    if ((tapPos.y - endPos.y) > pipiBtn.height / 2 * pipiBtn.scaleY) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        haveCost = UseCost(haveCost, PIPI);
                        if (Flag == "Succes")
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.y - endPos.y) < -pipiBtn.height / 2 * pipiBtn.scaleY) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        haveCost = UseCost(haveCost, PIPI);
                        if (Flag == "Succes")
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                    }
                    else if ((tapPos.x - endPos.x) < -pipiBtn.height / 2 * pipiBtn.scaleX || (tapPos.x - endPos.x) > pipiBtn.height / 2 * pipiBtn.scaleX) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        haveCost = UseCost(haveCost, PIPI);
                        if (Flag == "Succes")
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                    }
                        //パワーアップを選択時
                    else {
                        if (SpiritCheck(Spirits, Math.floor(PIPI.Level / powerUpInterval + 1), spiritsLength) && PIPI.Level < 20) {
                            PowerUp(PIPI);
                            //スケール変更で成長度合いの表現
                            PIPIHP.scaleY = -PIPI.HP * Math.pow(1.1, PIPI.Level) / MAXHP / 2.5;
                            PIPIATK.scaleY = -PIPI.ATK * Math.pow(1.1, PIPI.Level) / MAXATK / 2.5;
                            PIPISPEED.scaleY = -PIPI.SPEED / MAXSPEED / 2.5;
                            //使用した魂の削除
                            Spirits = UsedSpirits(Spirits, Math.floor(PIPI.Level / powerUpInterval + 1), spiritsLength, scene);
                        }
                    }
                }

                tapObj = null;
            });

            ////////描画////////
            //オブジェクトに追加する処理(ここに入れたいオブジェクトを描画順に指定)
            /////////////背景/////////////
            scene.addChild(back);

            scene.addChild(pupuBtn);
            scene.addChild(popoBtn);
            scene.addChild(pipiBtn);
            scene.addChild(deadlyBtn);

            scene.addChild(ponpu);

            scene.addChild(PUPU_UI);
            scene.addChild(POPO_UI);
            scene.addChild(PIPI_UI);

            //矢印表示のためにここに処理
            scene.on(Event.TOUCH_MOVE, function (nowPos) {
                //ププボタンの場所で押してた場合
                if (tapObj == "pupuBtn") {
                    Arrow = ArrowSet(PUPU, pipiBtn, tapPos, nowPos, Arrow, core);
                    scene.addChild(Arrow);
                }
                    //ポポボタンの場所で押してた場合
                else if (tapObj == "popoBtn") {
                    Arrow = ArrowSet(POPO, pipiBtn, tapPos, nowPos, Arrow, core);
                    scene.addChild(Arrow);
                }
                    //ピピボタンの場所で押してた場合
                else if (tapObj == "pipiBtn") {
                    Arrow = ArrowSet(PIPI, pipiBtn, tapPos, nowPos, Arrow, core);
                    scene.addChild(Arrow);
                }
            });
            scene.on(Event.TOUCH_END, function () {
                Arrow.x = 9000;
                Arrow.y = -9000;
            });

            //魂の受け取り&描画処理
            socket.on("SpiritPushed", function (SpiritData) {
                var _PlayerID = parseInt(SpiritData.PlayerID.toString());

                if (_PlayerID == myPlayerID) {
                    for (var i = 0; i < spiritsLength; i++) {
                        if (Spirits[i] == null) {
                            Spirits[i] = new Spirit(SpiritData.Type, SpiritData.PlayerID, core);
                            scene.addChild(Spirits[i].Sprite);
                            break;
                        }
                    }
                }
            });

            //フォント
            scene.addChild(CPFont);
            scene.addChild(PUPUCostFont);
            scene.addChild(POPOCostFont);
            scene.addChild(PIPICostFont);

            //所持コストのフォント
            for (var i = 0; i < costDigit; i++) {
                scene.addChild(costFont[i]);
            }

            //悪魔の必要コストフォント
            for (var i = 0; i < DemoncostDigit; i++)
            {
                scene.addChild(PUPUcostFont[i]);
                scene.addChild(POPOcostFont[i]);
                scene.addChild(PIPIcostFont[i]);
            }

            //各悪魔のステータスバー
            scene.addChild(PUPUHP);
            scene.addChild(PUPUHPicon);
            scene.addChild(PUPUATK);
            scene.addChild(PUPUATKicon);
            scene.addChild(PUPUSPEED);
            scene.addChild(PUPUSPEEDicon);
            scene.addChild(POPOHP);
            scene.addChild(POPOHPicon);
            scene.addChild(POPOATK);
            scene.addChild(POPOATKicon);
            scene.addChild(POPOSPEED);
            scene.addChild(POPOSPEEDicon);
            scene.addChild(PIPIHP);
            scene.addChild(PIPIHPicon);
            scene.addChild(PIPIATK);
            scene.addChild(PIPIATKicon);
            scene.addChild(PIPISPEED);
            scene.addChild(PIPISPEEDicon);

            /////////////前面/////////////
            //scene.addChild(FPSlbl);
            return scene;
        };

//////////////////////////リザルトシーン//////////////////////////////////////////////////////////////////////////////
        var ResultScene = function ()
        {
            var scene = new Scene();

            core.frame = 0;

            ////////画像情報処理////////
            //背景
            var resultBack = new Sprite(1280, 720);
            resultBack.image = core.assets['matchingUI/otu.png'];
            resultBack.scale(1, 1);
            resultBack.x = 0;
            resultBack.y = 0;

            var tapRequest = new Sprite(1280, 200);
            tapRequest.image = core.assets['matchingUI/game_end_tap.png'];
            tapRequest.x = core.width / 2 - tapRequest.width / 2;
            tapRequest.y = 500;

            scene.addChild(resultBack);
            scene.addChild(tapRequest);

            scene.addEventListener(Event.TOUCH_START, function ()
            {
                if (core.frame > core.fps * 1.5)
                {
                    socket.emit("PhoneFinalEnd");
                    window.location.reload();
                }     
            });

            return scene;
        };

//////////////////////////ポーズシーン//////////////////////////////////////////////////////////////////////////////
        var PauseScene = function ()
        {
            var scene = new Scene();

            ////////画像情報処理////////
            //背景
            var pauseUI = new Sprite(1024, 256);
            pauseUI.image = core.assets['matchingUI/see_mo.png'];
            pauseUI.scale(1, 1);
            pauseUI.x = core.width / 2 - pauseUI.width / 2;
            pauseUI.y = core.height / 2 - pauseUI.height / 2;

            scene.addChild(pauseUI);

            scene.backgroundColor = 'rgba(0,0,0,0.5)';

            //ゲーム終了を受け取ってリザルト画面へ移行
            socket.on("PushGameEndRequest", function () {
                core.replaceScene(ResultScene());
            });

            socket.on("PushStopEndRequest", function ()
            {
                if (stoppingFlag)
                {
                    stoppingFlag = false;
                    core.popScene();
                }
            });

            if (!stoppingFlag)
            {
                //秒間コストを受け取り
                socket.on("PushSecondCost", function (CostData)
                {
                    var intCost = parseInt(CostData.Cost.toString());
                    if (haveCost < MaxCost) {
                        haveCost += intCost;
                    }
                    else {
                        haveCost = MaxCost;
                    }
                });
            }

            return scene;
        };

        //////////////////////////シーンの読み込み//////////////////////////
        core.replaceScene(TitleScene());

    }
    core.start();
};

/////////////////クラス/////////////////
//デーモンクラス
function Demon(Type, Direction, Level, PlayerID, BaseCost, Cost, HP, ATK, SPEED){
    this.Type = Type;
    this.Direction = Direction;
    this.Level = Level;
    this.PlayerID = PlayerID;
    this.BaseCost = BaseCost;
    this.Cost = Cost;
    this.HP = HP;
    this.ATK = ATK;
    this.SPEED = SPEED;
}
//座標取得クラス
function TapPos(x, y) {
    this.x = x;
    this.y = y;
}
//スピリットクラス
function Spirit(Type, PlayerID, core)
{
    this.Type = Type;
    this.PlayerID = PlayerID;
    this.Sprite = new Sprite(600, 600);
    if (this.Type == "PUPU")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }
    else if (this.Type == "POPO")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }
    else if (this.Type == "PIPI")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }

    this.Sprite.scale(0.1, 0.1);

    this.Sprite.x = Math.floor(Math.random() * 200)  - 100;
    this.Sprite.y = Math.floor(Math.random() * 20) + 100;    
}

/////////////////関数/////////////////
function FontSet(_Cost, Digit, Sprite)
{
    if (Digit == 3) {
        Sprite.frame = _Cost / 1000;
    }
    else if (Digit == 2) {
        Sprite.frame = (_Cost % 1000) / 100;
    }
    else if (Digit == 1) {
        Sprite.frame = (_Cost % 100) / 10;
    }
    else if (Digit == 0) {
        Sprite.frame = _Cost % 10;
    }

    return Sprite;
}

//デーモンの初期化
function InitializeDemon(Demon, defaultDemon)
{
    Demon = defaultDemon;

    return Demon;
}

function InitializeCost(haveCost, defaulthaveCost)
{
    haveCost = defaulthaveCost;

    return haveCost;
}

function InitializeMaxCost(MaxCost, defaultMaxCost)
{
    MaxCost = defaultMaxCost;

    return defaultMaxCost;
}

//コストが使えるかの確認
function CostCheck(_haveCost, _demon, _Flag)
{
    if (_haveCost - (_demon.Cost + _demon.Level * 10) >= 0) {
        _Flag = "Succes";
    }
    else {
        _Flag = "Faild";
        console.log("Faild");
    }
    return _Flag;
}
//コスト消費
function UseCost(_haveCost, _demon)
{
    if (_haveCost - _demon.Cost >= 0)
    {
        _haveCost -= _demon.Cost;
    }
    return _haveCost;
}
//スピリットが足りてるかの確認
function SpiritCheck(_Spirits, _Cost, Length)
{
    var countSpirit = 0;
    for(var i = 0; i < Length; i++)
    {
        //ここでスピリットデータがあるかの確認をする。
        if (_Spirits[i] != null)
        {
            countSpirit += 1;
        }
    }
    //スピリット量が必殺技コストより多い場合trueを返す
    if (countSpirit >= _Cost)
    {
        return true;
    }
    else
    {
        return false;
    }
}
//スピリット消費
function UsedSpirits(_Spirits, _Cost, Length, scene)
{
    var count = 0;

    for (var i = 0; i < Length; i++)
    {
        if(_Spirits[i] != null)
        {
            scene.removeChild(_Spirits[i].Sprite);
            _Spirits[i] = null;
            count += 1;
            if (count >= _Cost)
                break;
        }
    }

    return _Spirits;
}
//悪魔の強化
function PowerUp(Demon)
{
    Demon.Level += 1;
    Demon.Cost = Demon.BaseCost + Demon.Level * 10;

    return Demon;
}
//矢印の方向指定
function ArrowSet(demon, btn, startPos, endPos, Arrow, core)
{
    //座標の移動幅を見て方向指定
    //上方向時
    if ((startPos.y - endPos.y) > btn.height / 2 * btn.scaleY)
    {
        if (demon.Type == "PUPU")
        {
            Arrow.image = core.assets['img/ya_red.png'];
            Arrow.x = 800;
            Arrow.y = -250;
            Arrow.rotation = 0;
        }
        else if (demon.Type == "POPO")
        {
            Arrow.image = core.assets['img/ya_green.png'];
            Arrow.x = 800;
            Arrow.y = -25;
            Arrow.rotation = 0;
        }
        else if (demon.Type == "PIPI")
        {
            Arrow.image = core.assets['img/ya_blue.png'];
            Arrow.x = 800;
            Arrow.y = 200;
            Arrow.rotation = 0;
        }        
    }
    //下方向時
    else if ((startPos.y - endPos.y) < -btn.height / 2 * btn.scaleY)
    {
        if (demon.Type == "PUPU") {
            Arrow.image = core.assets['img/ya_red.png'];
            Arrow.x = 800;
            Arrow.y = -85;
            Arrow.rotation = 180;
        }
        else if (demon.Type == "POPO") {
            Arrow.image = core.assets['img/ya_green.png'];
            Arrow.x = 800;
            Arrow.y = 140;
            Arrow.rotation = 180;
        }
        else if (demon.Type == "PIPI") {
            Arrow.image = core.assets['img/ya_blue.png'];
            Arrow.x = 800;
            Arrow.y = 365;
            Arrow.rotation = 180;
        }
    }
    //右方向時
    else if ((startPos.x - endPos.x) < -btn.height / 2 * btn.scaleX)
    {
        if (demon.Type == "PUPU") {
            Arrow.image = core.assets['img/ya_red.png'];
            Arrow.x = 900;
            Arrow.y = -172.5;
            Arrow.rotation = 90;
        }
        else if (demon.Type == "POPO") {
            Arrow.image = core.assets['img/ya_green.png'];
            Arrow.x = 900;
            Arrow.y = 62.5;
            Arrow.rotation = 90;
        }
        else if (demon.Type == "PIPI") {
            Arrow.image = core.assets['img/ya_blue.png'];
            Arrow.x = 900;
            Arrow.y = 287.5;
            Arrow.rotation = 90;
        }
    }
    //左方向時
    else if ((startPos.x - endPos.x) > btn.height / 2 * btn.scaleX)
    {
        if (demon.Type == "PUPU") {
            Arrow.image = core.assets['img/ya_red.png'];
            Arrow.x = 700;
            Arrow.y = -172.5;
            Arrow.rotation = 270;
        }
        else if (demon.Type == "POPO") {
            Arrow.image = core.assets['img/ya_green.png'];
            Arrow.x = 700;
            Arrow.y = 62.5;
            Arrow.rotation = 270;
        }
        else if (demon.Type == "PIPI") {
            Arrow.image = core.assets['img/ya_blue.png'];
            Arrow.x = 700;
            Arrow.y = 287.5;
            Arrow.rotation = 270;
        }
    }

    return Arrow;
}

//デーモンの送信
function PushDemon(demon, btn, startPos, endPos, setPlayerID)
{
    //座標の移動幅を見て方向指定
    if ((startPos.y - endPos.y) > btn.height / 2 * btn.scaleY) {
        demon.Direction = "Top";
    }
    else if ((startPos.y - endPos.y) < -btn.height / 2 * btn.scaleY) {
        demon.Direction = "Bottom";
    }
    else if ((startPos.x - endPos.x) < -btn.height / 2 * btn.scaleX || (startPos.x - endPos.x) > btn.height / 2 * btn.scaleX) {
        demon.Direction = "Middle";
    }
    else {
        demon.Direction = "None";
    }
    //プレイヤーID設定
    demon.PlayerID = setPlayerID;

    //データ送信
    if (demon.Direction != "None")
        socket.emit("DemonPush", { Type: demon.Type, Direction: demon.Direction, Level: demon.Level, PlayerID: demon.PlayerID });

    //ログ出力
    console.log(demon.Type);
    console.log(demon.Direction);
    console.log(demon.Level);
    console.log(demon.PlayerID);
}

//必殺技送信
function PushDeadly(setPlayerID)
{
    socket.emit("DeadlyPush", { Deadly: "Fire", PlayerID: setPlayerID});
    console.log("DeadlyPushed");
}

//エラー時アラートが呼び出されるように
window.onerror = function(error)
{
    alert(error);
}
