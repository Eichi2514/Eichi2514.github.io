$(document).ready(function () {
    console.clear();

// 처음 화면

    $(".start_btn").click(function () {
        // 시작 버튼을 클릭하면
        $(".game_start").addClass("hidden"); // 게임 화면을 없에고
        $(".choice").removeClass("hidden"); // 캐릭터 선택 화면을 살린다
    });

    console.clear();

// 캐릭터 선택

    $(".ps").mouseenter(function () {
        // 캐릭터에 마우스가 올라가면
        $(this).find("i").removeClass("fa-4x");
        $(this).find("i").addClass("fa-6x"); // 마우스가 올라간 자식의 이미지를 4x에서 6x로 키운다
    });

    $(".ps").mouseleave(function () {
        // 캐릭터에서 마우스가 내려가면
        $(this).find("i").removeClass("fa-6x");
        $(this).find("i").addClass("fa-4x"); //마우스의 내려간 자식의 이미지를 6x에서 4x로 되돌린다
    });

    $(".p1").click(function () {
        // 첫번째 캐릭터를 클릭하면
        $(".p1t").removeClass("hidden"); // 첫번째 캐릭터의 안내문구가 나온다
    });

    $(".p1t_yes").click(function () {
        // 첫번째 캐릭터의 안내문구의 확인을 클릭하면
        $(".choice").addClass("hidden"); // 캐릭터 선택 화면을 없에고
        $(".map").removeClass("hidden"); // 맵 화면을 살리고
        $(".keybord_box").removeClass("hidden"); // 화면 조작키를 살리고
        $(".dragon").removeClass("hidden"); // 드래곤 캐릭터를 살리고
        $(".p1t").addClass("hidden"); // 첫번째 캐릭터의 안내문구를 없엔다
    });

    $(".p1t_no").click(function () {
        // 첫번째 캐릭터의 안내문구의 취소를 클릭하면
        $(".p1t").addClass("hidden"); // 첫번째 캐릭터의 안내문구를 없엔다
    });

    $(".p2").click(function () {
        // 두번째 캐릭터를 클릭하면
        $(".p2t").removeClass("hidden"); // 두번째 캐릭터의 안내문구가 나온다
    });

    $(".p2t_yes").click(function () {
        $(".choice").addClass("hidden"); // 캐릭터 선택 화면을 없에고
        $(".map").removeClass("hidden"); // 맵 화면을 살리고
        $(".keybord_box").removeClass("hidden"); // 화면 조작키를 살리고
        $(".otter").removeClass("hidden"); // 수달 캐릭터를 살리고
        $(".p2t").addClass("hidden"); // 두번째 캐릭터의 안내문구를 없엔다
    });

    $(".p2t_no").click(function () {
        // 두번째 캐릭터의 안내문구의 취소를 클릭하면
        $(".p2t").addClass("hidden"); // 두번째 캐릭터의 안내문구를 없엔다
    });

    $(".p3").click(function () {
        // 세번째 캐릭터를 클릭하면
        $(".p3t").removeClass("hidden"); // 세번째 캐릭터의 안내문구가 나온다
    });

    $(".p3t_yes").click(function () {
        $(".choice").addClass("hidden"); // 캐릭터 선택 화면을 없에고
        $(".map").removeClass("hidden"); // 맵 화면을 살리고
        $(".keybord_box").removeClass("hidden"); // 화면 조작키를 살리고
        $(".ghost").removeClass("hidden"); // 유령 캐릭터를 살리고
        $(".p3t").addClass("hidden"); // 세번째 캐릭터의 안내문구를 없엔다
    });

    $(".p3t_no").click(function () {
        // 세번째 캐릭터의 안내문구의 취소를 클릭하면
        $(".p3t").addClass("hidden"); // 두번째 캐릭터의 안내문구를 없엔다
    });

// 메인
    let UD = 50; // 상하 위치를 저장할 변수
    let LR = 50; // 좌우 위치를 저장할 변수
    let key = false; // 열쇠의 획득 여부를 저장할 변수
    let go = $(".ghost").hasClass("hidden"); // 유령 캐릭터를 선택했는지 확인하는 변수
    function up() {
        $(".character").css("transform", "rotate(270deg)"); // 캐릭터가 270도 회전해서 위쪽을 바라보게한다
        let go = $(".ghost").hasClass("hidden"); // 유령 캐릭터를 선택했는지 확인하는 변수
        if (
            go == false || // 유령 캐릭터를 선택했으면 아래 제약조건과 상관없이 이동이 가능하다
            (LR == 50 && 50 < UD && UD < 350) ||
            (LR == 50 && 400 < UD) ||
            (LR == 150 && 250 < UD) ||
            (LR == 200 && 50 < UD && UD < 200) ||
            (LR == 250 && 150 < UD && UD < 300) ||
            (LR == 250 && 350 < UD) ||
            (LR == 350 && 50 < UD && UD < 200) ||
            (LR == 350 && 250 < UD) ||
            (LR == 450 && 150 < UD && UD < 300) ||
            (LR == 450 && 350 < UD) // 벽의 위치를 확인하는 과정
        ) {
            UD -= 5; // 상하 값을 5 감소시켜서
            $(".character").css("top", UD + "px"); // 위쪽으로 5px 옮긴다
        }
        console.log("LR:" + LR + ", UD:" + UD + ", key : " + key); // 현재 위치와 key의 획득 여부를 확인하기위한 코드
        key_hidden(); // 키 이벤트 발생 확인
        map_hidden(); // 맵 이벤트 발생 확인
        goal_hidden(); // 골 이벤트 발생 확인
    }

    function down() {
        $(".character").css("transform", "rotate(90deg)"); // 캐릭터가 90도 회전해서 아래쪽을 바라보게한다
        let go = $(".ghost").hasClass("hidden"); // 유령 캐릭터를 선택했는지 확인하는 변수
        if (
            go == false || // 유령 캐릭터를 선택했으면 아래 제약조건과 상관없이 이동이 가능하다
            (LR == 50 && UD < 300) ||
            (LR == 50 && 350 < UD && UD < 450) ||
            (LR == 150 && 200 < UD && UD < 450) ||
            (LR == 200 && UD < 150) ||
            (LR == 250 && 100 < UD && UD < 250) ||
            (LR == 250 && 300 < UD && UD < 450) ||
            (LR == 350 && UD < 150) ||
            (LR == 350 && 200 < UD && UD < 450) ||
            (LR == 450 && 100 < UD && UD < 250) ||
            (LR == 450 && 300 < UD && UD < 450) // 벽의 위치를 확인하는 과정
        ) {
            UD += 5; // 상하 값을 5 증가시켜서
            $(".character").css("top", UD + "px"); // 아래쪽으로 5px 옮긴다
        }
        console.log("LR:" + LR + ", UD:" + UD + ", key : " + key); // 현재 위치와 key의 획득 여부를 확인하기위한 코드
        key_hidden(); // 키 이벤트 발생 확인
        map_hidden(); // 맵 이벤트 발생 확인
        goal_hidden(); // 골 이벤트 발생 확인
    }

    function left() {
        $(".character").css("transform", "scaleX(-1)"); // 캐릭터가 왼쪽으로 뒤집혀서 왼쪽을 바라보게한다
        let go = $(".ghost").hasClass("hidden"); // 유령 캐릭터를 선택했는지 확인하는 변수
        if (
            go == false || // 유령 캐릭터를 선택했으면 아래 제약조건과 상관없이 이동이 가능하다
            (UD == 50 && 50 < LR && LR <= 100) ||
            (UD == 50 && 200 < LR) ||
            (UD == 150 && 50 < LR && LR < 300) ||
            (UD == 150 && 350 < LR) ||
            (UD == 250 && 50 < LR && LR < 200) ||
            (UD == 250 && 350 < LR) ||
            (UD == 350 && 150 < LR && LR < 300) ||
            (UD == 350 && 350 < LR) ||
            (UD == 400 && 50 < LR && LR < 200) // 벽의 위치를 확인하는 과정
        ) {
            LR -= 5; // 좌우 값을 5 감소시켜서
            $(".character").css("left", LR + "px"); // 왼쪽으로 5px 옮긴다
        }
        console.log("LR:" + LR + ", UD:" + UD + ", key : " + key); // 현재 위치와 key의 획득 여부를 확인하기위한 코드
        key_hidden(); // 키 이벤트 발생 확인
        map_hidden(); // 맵 이벤트 발생 확인
        goal_hidden(); // 골 이벤트 발생 확인
    }

    function right() {
        $(".character").css("transform", "scaleX(1)"); // 캐릭터를 원래 방향으로 뒤집어서 오른쪽을 바라보게한다
        let go = $(".ghost").hasClass("hidden"); // 유령 캐릭터를 선택했는지 확인하는 변수
        if (
            go == false || // 유령 캐릭터를 선택했으면 아래 제약조건과 상관없이 이동이 가능하다
            (UD == 50 && LR < 100) ||
            (UD == 50 && 150 < LR && LR < 450) ||
            (UD == 150 && LR < 250) ||
            (UD == 150 && 300 < LR && LR < 450) ||
            (UD == 250 && LR < 150) ||
            (UD == 250 && 300 < LR && LR < 450) ||
            (UD == 350 && 100 < LR && LR < 250) ||
            (UD == 350 && 300 < LR && LR < 450) ||
            (UD == 400 && LR < 150) // 벽의 위치를 확인하는 과정
        ) {
            LR += 5; // 좌우 값을 5 증가시켜서
            $(".character").css("left", LR + "px"); // 오른쪽으로 5px 옮긴다
        }
        console.log("LR:" + LR + ", UD:" + UD + ", key : " + key); // 현재 위치와 key의 획득 여부를 확인하기위한 코드
        key_hidden(); // 키 이벤트 발생 확인
        map_hidden(); // 맵 이벤트 발생 확인
        goal_hidden(); // 골 이벤트 발생 확인
    }

    let alertShown = false; // 알림창이 표시되었는지 여부를 저장

    function goal_hidden() {
        if (LR == 450 && UD == 450 && !key) {
            if (!alertShown) { // 알림창이 아직 표시되지 않았다면
                alert("열쇠가 필요합니다.");
                alertShown = true; // 알림창 표시 상태를 true로 변경
            }
            return; // 이후 코드를 실행하지 않음
        }

        if (LR == 450 && UD == 450 && key) {
            // 골인 조건을 충족한 경우
            $(".map").addClass("hidden"); // 맵을 없애고
            $(".keybord_box").addClass("hidden"); // 화면 조작키를 없애고
            $(".goal").removeClass("hidden"); // 골인 화면을 표시
        }
    }

    function key_hidden() {
        if (LR == 250 && UD == 250) {
            // 키의 위치 좌우 250, 상하 250을 달성하면
            key = true; // 키의 값을 true로 바꾸고
            $(".key").css("top", "0px").css("left", "450px"); // key의 위치를 오른쪽 위로 옮기고
            $(".key").addClass("bg-yellow-300"); // 키의 배경색을 노란색으로 바꾼다
        }
    }

    function map_hidden() {
        // 각 조건문을 달성하면
        // 상, 하, 좌, 우, 대각선 총 8방향의 길을 확인해서 1초동안 fadein하면서 살린다
        // 아래는 처음엔 인텔리제이때 만들었던거처럼 맵을 여러개 만들 생각으로
        // 모든 위치에서 길을 확인하게 짠 코드라 없는길의 class도 적혀있는데
        // 자바스크립트 만으로는 시간이 너무 오래 걸려서 맵의 추가 여부는 무기한 보류되었다
        if (LR == 50 && UD == 50) {
            $(".r11, .r12, .r21, .r22").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 50) {
            $(".r11, .r12, .r13, .r21, .r22, .r23").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 150 && UD == 50) {
            $(".r12, .r13, .r14, .r22, .r23, .r24").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 200 && UD == 50) {
            $(".r13, .r14, .r15, .r23, .r24, .r25").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 250 && UD == 50) {
            $(".r14, .r15, .r16, .r24, .r25, .r26").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 300 && UD == 50) {
            $(".r15, .r16, .r17, .r25, .r26, .r27").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 350 && UD == 50) {
            $(".r16, .r17, .r18, .r26, .r27, .r28").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 400 && UD == 50) {
            $(".r17, .r18, .r19, .r27, .r28, .r29").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 450 && UD == 50) {
            $(".r18, .r19, .r28, .r29").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 50 && UD == 100) {
            $(".r11, .r12, .r21, .r22, .r31, .r32").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 100) {
            $(".r11, .r12, .r13, .r21, .r22, .r23, .r31, .r32, .r33")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 150 && UD == 100) {
            $(".r12, .r13, .r14, .r22, .r23, .r24, .r32, .r33, .r34")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 200 && UD == 100) {
            $(".r13, .r14, .r15, .r23, .r24, .r25, .r33, .r34, .r35")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 250 && UD == 100) {
            $(".r14, .r15, .r16, .r24, .r25, .r26, .r34, .r35, .r36")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 300 && UD == 100) {
            $(".r15, .r16, .r17, .r25, .r26, .r27, .r35, .r36, .r37")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 350 && UD == 100) {
            $(".r16, .r17, .r18, .r26, .r27, .r28, .r36, .r37, .r38")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 400 && UD == 100) {
            $(".r17, .r18, .r19, .r27, .r28, .r29, .r37, .r38, .r39")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 450 && UD == 100) {
            $(".r18, .r19, .r28, .r29, .r38, .r39").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 50 && UD == 150) {
            $(".r21, .r22, .r31, .r32, .r41, .r42").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 150) {
            $(".r21, .r22, .r23, .r31, .r32, .r33, .r41, .r42, .r43")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 150 && UD == 150) {
            $(".r42, .r43, .r44, .r22, .r23, .r24, .r32, .r33, .r34")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 200 && UD == 150) {
            $(".r43, .r44, .r45, .r23, .r24, .r25, .r33, .r34, .r35")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 250 && UD == 150) {
            $(".r44, .r45, .r46, .r24, .r25, .r26, .r34, .r35, .r36")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 300 && UD == 150) {
            $(".r45, .r46, .r47, .r25, .r26, .r27, .r35, .r36, .r37")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 350 && UD == 150) {
            $(".r46, .r47, .r48, .r26, .r27, .r28, .r36, .r37, .r38")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 400 && UD == 150) {
            $(".r47, .r48, .r49, .r27, .r28, .r29, .r37, .r38, .r39")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 450 && UD == 150) {
            $(".r48, .r49, .r28, .r29, .r38, .r39").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 50 && UD == 200) {
            $(".r41, .r42, .r51, .r52, .r31, .r32").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 200) {
            $(".r41, .r42, .r43, .r51, .r52, .r53, .r31, .r32, .r33")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 150 && UD == 200) {
            $(".r42, .r43, .r44, .r52, .r53, .r54, .r32, .r33, .r34")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 200 && UD == 200) {
            $(".r43, .r44, .r45, .r53, .r54, .r55, .r33, .r34, .r35")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 250 && UD == 200) {
            $(".r44, .r45, .r46, .r54, .r55, .r56, .r34, .r35, .r36")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 300 && UD == 200) {
            $(".r45, .r46, .r47, .r55, .r56, .r57, .r35, .r36, .r37")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 350 && UD == 200) {
            $(".r46, .r47, .r48, .r56, .r57, .r58, .r36, .r37, .r38")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 400 && UD == 200) {
            $(".r47, .r48, .r49, .r57, .r58, .r59, .r37, .r38, .r39")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 450 && UD == 200) {
            $(".r48, .r49, .r58, .r59, .r38, .r39").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 50 && UD == 250) {
            $(".r41, .r42, .r51, .r52, .r61, .r62").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 250) {
            $(".r41, .r42, .r43, .r51, .r52, .r53, .r61, .r62, .r63")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 150 && UD == 250) {
            $(".r42, .r43, .r44, .r52, .r53, .r54, .r62, .r63, .r64")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 200 && UD == 250) {
            $(".r43, .r44, .r45, .r53, .r54, .r55, .r63, .r64, .r65")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 250 && UD == 250) {
            $(".r44, .r45, .r46, .r54, .r55, .r56, .r64, .r65, .r66")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 300 && UD == 250) {
            $(".r45, .r46, .r47, .r55, .r56, .r57, .r65, .r66, .r67")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 350 && UD == 250) {
            $(".r46, .r47, .r48, .r56, .r57, .r58, .r66, .r67, .r68")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 400 && UD == 250) {
            $(".r47, .r48, .r49, .r57, .r58, .r59, .r67, .r68, .r69")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 450 && UD == 250) {
            $(".r48, .r49, .r58, .r59, .r68, .r69").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 50 && UD == 300) {
            $(".r71, .r72, .r51, .r52, .r61, .r62").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 300) {
            $(".r71, .r72, .r73, .r51, .r52, .r53, .r61, .r62, .r63")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 150 && UD == 300) {
            $(".r72, .r73, .r74, .r52, .r53, .r54, .r62, .r63, .r64")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 200 && UD == 300) {
            $(".r73, .r74, .r75, .r53, .r54, .r55, .r63, .r64, .r65")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 250 && UD == 300) {
            $(".r74, .r75, .r76, .r54, .r55, .r56, .r64, .r65, .r66")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 300 && UD == 300) {
            $(".r75, .r76, .r77, .r55, .r56, .r57, .r65, .r66, .r67")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 350 && UD == 300) {
            $(".r76, .r77, .r78, .r56, .r57, .r58, .r66, .r67, .r68")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 400 && UD == 300) {
            $(".r77, .r78, .r79, .r57, .r58, .r59, .r67, .r68, .r69")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 450 && UD == 300) {
            $(".r78, .r79, .r58 .r59, .r68, .r69").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 50 && UD == 350) {
            $(".r71, .r72, .r81, .r82, .r61, .r62").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 350) {
            $(".r71, .r72, .r73, .r81, .r82, .r83, .r61, .r62, .r63")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 150 && UD == 350) {
            $(".r72, .r73, .r74, .r82, .r83, .r84, .r62, .r63, .r64")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 200 && UD == 350) {
            $(".r73, .r74, .r75, .r83, .r84, .r85, .r63, .r64, .r65")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 250 && UD == 350) {
            $(".r74, .r75, .r76, .r84, .r85, .r86, .r64, .r65, .r66")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 300 && UD == 350) {
            $(".r75, .r76, .r77, .r85, .r86, .r87, .r65, .r66, .r67")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 350 && UD == 350) {
            $(".r76, .r77, .r78, .r86, .r87, .r88, .r66, .r67, .r68")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 400 && UD == 350) {
            $(".r77, .r78, .r79, .r87, .r88, .r89, .r67, .r68, .r69")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 450 && UD == 350) {
            $(".r78, .r79, .r88 .r89, .r68, .r69").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 50 && UD == 400) {
            $(".r71, .r72, .r81, .r82, .r91, .r92").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 400) {
            $(".r71, .r72, .r73, .r81, .r82, .r83, .r91, .r92, .r93")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 150 && UD == 400) {
            $(".r72, .r73, .r74, .r82, .r83, .r84, .r92, .r93, .r94")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 200 && UD == 400) {
            $(".r73, .r74, .r75, .r83, .r84, .r85, .r93, .r94, .r95")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 250 && UD == 400) {
            $(".r74, .r75, .r76, .r84, .r85, .r86, .r94, .r95, .r96")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 300 && UD == 400) {
            $(".r75, .r76, .r77, .r85, .r86, .r87, .r95, .r96, .r97")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 350 && UD == 400) {
            $(".r76, .r77, .r78, .r86, .r87, .r88, .r96, .r97, .r98")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 400 && UD == 400) {
            $(".r77, .r78, .r79, .r87, .r88, .r89, .r97, .r98, .r99")
                .fadeIn(1000)
                .removeClass("hidden");
        }
        if (LR == 450 && UD == 400) {
            $(".r78, .r79, .r88 .r89, .r98, .r99").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 50 && UD == 450) {
            $(".r81, .r82, .r91, .r92").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 100 && UD == 450) {
            $(".r81, .r82, .r83, .r91, .r92, .r93").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 150 && UD == 450) {
            $(".r82, .r83, .r84, .r92, .r93, .r94").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 200 && UD == 450) {
            $(".r83, .r84, .r85, .r93, .r94, .r95").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 250 && UD == 450) {
            $(".r84, .r85, .r86, .r94, .r95, .r96").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 300 && UD == 450) {
            $(".r85, .r86, .r87, .r95, .r96, .r97").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 350 && UD == 450) {
            $(".r86, .r87, .r88, .r96, .r97, .r98").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 400 && UD == 450) {
            $(".r87, .r88, .r89, .r97, .r98, .r99").fadeIn(1000).removeClass("hidden");
        }
        if (LR == 450 && UD == 450) {
            $(".r88, .r89, .r98, .r99").fadeIn(1000).removeClass("hidden");
        }
    }

    let moveActionChack = null; // 현재 움직이고 있는 방향 추적
    let lastMoveTime = 0; // 마지막 이동 시간 추적
    let moveSpeed = 50; // 이동 속도 (밀리초 단위, 높을수록 느려짐)

    function startMoving(moveAction) {
        // 이미 해당 방향으로 움직이고 있으면 중복 방지
        if (moveActionChack === moveAction) return;

        // 새로운 방향으로 이동 시작
        stopMoving(); // 이전 움직임을 중지하고 새로운 움직임 시작
        moveActionChack = moveAction;

        // 애니메이션 시작
        move();
    }

    function move() {
        let currentTime = Date.now();

        // 일정 시간이 지나지 않으면 이동하지 않도록 속도 제한
        if (currentTime - lastMoveTime < moveSpeed) {
            requestAnimationFrame(move); // 빠르게 반복하지 않도록 대기
            return;
        }

        // 이동 처리
        if (moveActionChack === 'left') {
            left();
        } else if (moveActionChack === 'up') {
            up();
        } else if (moveActionChack === 'right') {
            right();
        } else if (moveActionChack === 'down') {
            down();
        }

        // 마지막 이동 시간을 기록
        lastMoveTime = currentTime;

        // 다음 프레임을 요청
        requestAnimationFrame(move);
    }

    function stopMoving() {
        moveActionChack = null; // 현재 방향 초기화
    }

// 캐릭터 이동
    $(window).keydown(function (e) {

        // 이미 눌린 키가 아닐 때만 동작
        if (e.keyCode === 37) {
            e.preventDefault();
            if (moveActionChack !== 'left') startMoving('left');
        } else if (e.keyCode === 38) {
            e.preventDefault();
            if (moveActionChack !== 'up') startMoving('up');
        } else if (e.keyCode === 39) {
            e.preventDefault();
            if (moveActionChack !== 'right') startMoving('right');
        } else if (e.keyCode === 40) {
            e.preventDefault();
            if (moveActionChack !== 'down') startMoving('down');
        }
    });

    // 키에서 손을 뗄 때 움직임 멈춤
    $(window).keyup(function (e) {
        // 눌렀던 방향키에서 손을 뗐을 때 이동 중지
        if ((e.keyCode === 37 && moveActionChack === 'left') ||
            (e.keyCode === 38 && moveActionChack === 'up') ||
            (e.keyCode === 39 && moveActionChack === 'right') ||
            (e.keyCode === 40 && moveActionChack === 'down')) {
            stopMoving();
        }
    });

    $(".key-left").on("touchstart", function (e) {
        e.preventDefault();

        // 화면 조작키 왼쪽을 터치하면
        if (moveActionChack !== 'left') {
            startMoving('left'); // 왼쪽 메소드 실행
        }
    });

    $(".key-up").on("touchstart", function (e) {
        e.preventDefault();

        // 화면 조작키 윗쪽을 터치하면
        if (moveActionChack !== 'up') {
            startMoving('up'); // 윗쪽 메소드 실행
        }
    });

    $(".key-right").on("touchstart", function (e) {
        e.preventDefault();

        // 화면 조작키 오른쪽을 터치하면
        if (moveActionChack !== 'right') {
            startMoving('right'); // 오른쪽 메소드 실행
        }
    });

    $(".key-down").on("touchstart", function (e) {
        e.preventDefault();

        // 화면 조작키 아래쪽을 터치하면
        if (moveActionChack !== 'down') {
            startMoving('down'); // 아래쪽 메소드 실행
        }
    });

    $(".key-left").on("touchend", function () {
        // 화면 조작키 왼쪽 터치끝나면
        if (moveActionChack === 'left') {
            stopMoving(); // 종료
        }
    });

    $(".key-up").on("touchend", function () {
        // 화면 조작키 윗쪽 터치끝나면
        if (moveActionChack === 'up') {
            stopMoving(); // 종료
        }
    });

    $(".key-right").on("touchend", function () {
        // 화면 조작키 오른쪽 터치끝나면
        if (moveActionChack === 'right') {
            stopMoving(); // 종료
        }
    });

    $(".key-down").on("touchend", function () {
        // 화면 조작키 아래쪽 터치끝나면
        if (moveActionChack === 'down') {
            stopMoving(); // 종료
        }
    });

// 엔딩 (게임 동작중 바뀐것들 초기화)
    $(".goal_chick").click(function () {
        // 골인을 클릭하면
        $(".road").fadeOut(1000).addClass("hidden"); // 맵 화면의 길을 전부 없에고
        $(".goal").addClass("hidden"); // 골인 화면을 없에고
        $(".game_start").removeClass("hidden"); // 초기 화면을 살리고
        $(".dragon").addClass("hidden"); // 드래곤 캐릭터를 없에고
        $(".otter").addClass("hidden"); // 수달 캐릭터를 없에고
        $(".ghost").addClass("hidden"); // 유령 캐릭터를 없에고
        UD = 50; // 상하 값을 초기값 50으로 변경하고
        LR = 50; // 좌우 값을 초기값 50으로 변경하고
        key = false; // 키의 값을 false로 바꾸고
        $(".character").css("top", "50px").css("left", "50px"); // 캐릭터의 초기 위치를 초기값으로 바꾸고
        $(".key").css("top", "250px").css("left", "250px"); // 키의 초기 위치를 초기값으로 바꾸고
        $(".r11, .r12, .r21, .r22, .r55, .r99").fadeIn(1000).removeClass("hidden"); // 처음 위치에서 보여질 길을 살리고
        $(".key").removeClass("bg-yellow-300"); // 키의 배경색을 없엔다
    });

    const $projects = $('.projects');
    const $project = $('.project');
    const $left_btn = $('.left_btn');
    const $right_btn = $('.right_btn');
    const totalProjects = $('.project').length - 7;
    let currentIndex = 0;
    let intervalId;

    // 슬라이드 시작 함수
    function startSlider() {
        intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalProjects; // 현재 인덱스 갱신
            const offset = currentIndex * -720; // 720px씩 이동
            $projects.css('transform', `translateX(${offset}px)`);
        }, 2000);
    }

    // 슬라이드 중지 함수
    function stopSlider() {
        clearInterval(intervalId);
    }

    // 슬라이드 이동 함수 (왼쪽, 오른쪽 버튼 클릭 시)
    function moveSlide(direction) {
        if (direction === 'left') {
            currentIndex = (currentIndex - 1 + totalProjects) % totalProjects;
        } else if (direction === 'right') {
            currentIndex = (currentIndex + 1) % totalProjects;
        }
        const offset = currentIndex * -720; // 720px씩 이동
        $projects.css('transform', `translateX(${offset}px)`);
    }

    // 슬라이드를 시작
    startSlider();

    // 마우스가 .projects 위에 올라가면 슬라이드 멈추기
    $project.on('mouseenter', stopSlider);
    $left_btn.on('mouseenter', stopSlider);
    $right_btn.on('mouseenter', stopSlider);

    // 마우스가 .projects를 떠나면 슬라이드 재시작
    $project.on('mouseleave', startSlider);
    $left_btn.on('mouseleave', startSlider);
    $right_btn.on('mouseleave', startSlider);

    // 왼쪽 버튼 클릭 시 슬라이드 이동
    $('.left_btn').on('click', function () {
        moveSlide('left');
    });

    // 오른쪽 버튼 클릭 시 슬라이드 이동
    $('.right_btn').on('click', function () {
        moveSlide('right');
    });

    document.querySelector(".gform").addEventListener("submit", function (event) {
        event.preventDefault(); // 폼 기본 동작 중지
        document.getElementById("submitBtn").disabled = true; // 버튼 비활성화

        // 비동기로 폼 데이터 전송
        fetch(event.target.action, {
            method: "POST",
            body: new FormData(event.target)
        })
            .then((response) => {
                if (response.ok) {
                    alert("이메일이 성공적으로 전송되었습니다!");
                } else {
                    response.text().then((errorMessage) => {
                        alert("이메일 전송에 실패했습니다: " + errorMessage);
                    });
                }
            })
            .catch((error) => {
                console.error("전송 중 오류 발생:", error);
                alert("이메일 전송에 실패했습니다. 다시 시도해주세요.");
            })
            .finally(() => {
                document.getElementById("submitBtn").disabled = false; // 버튼 활성화
            });
    });

    const followImageBasic = document.querySelector('.mouse__basic'); // 기본 이미지 선택
    const followImageAction = document.querySelector('.mouse__action'); // 액션 이미지 선택
    let posX = 0, posY = 0;

    const isMobile = () => window.innerWidth <= 768;

    if (!isMobile()) {
        document.addEventListener('mousemove', (event) => {
            posX = event.pageX;
            posY = event.pageY;
        });

        function animate() {
            const currentX = parseFloat(followImageAction.style.left) || 0;
            const currentY = parseFloat(followImageAction.style.top) || 0;

            const offsetX = 15; // X축 오프셋
            const offsetY = 0;  // Y축 오프셋

            // 이동 속도를 조절하는 계수 (0.1 값에서 작을수록 느려짐)
            const speedFactor = 0.1; // 속도를 늦추기 위해 작게 설정

            // 기본 이미지와 액션 이미지의 거리 계산
            const distance = Math.sqrt((posX - currentX) ** 2 + (posY - currentY) ** 2); // 현재 이미지와 마우스 위치 간 거리 계산
            const threshold = 16; // 거리 임계값

            // 기본 이미지의 위치 업데이트
            followImageBasic.style.left = posX + offsetX + 'px'; // 기본 이미지 위치 업데이트
            followImageBasic.style.top = posY + offsetY + 'px';  // 기본 이미지 위치 업데이트

            if (distance > threshold) {
                followImageBasic.style.display = 'none';
                followImageAction.style.display = 'block';
                followImageAction.style.left = currentX + (posX + offsetX - currentX) * speedFactor + 'px'; // X축으로 오프셋 추가
                followImageAction.style.top = currentY + (posY + offsetY - currentY) * speedFactor + 'px';  // Y축으로 오프셋 추가

                // 마우스 방향을 계산하여 회전 각도 설정
                const angle = Math.atan2(posY - currentY, posX - currentX) * (180 / Math.PI); // 라디안 값을 도로 변환

                // 마우스 위치에 따라 좌우 반전 처리
                if (posX < currentX) {
                    // 왼쪽을 바라볼 때 (기본값)
                    followImageAction.style.transform = `rotate(${angle + 180}deg) scaleX(1)`;
                } else {
                    // 오른쪽을 바라볼 때 (이미지를 뒤집음)
                    followImageAction.style.transform = `rotate(${angle}deg) scaleX(-1)`;
                }
            } else {
                followImageBasic.style.display = 'block';
                followImageAction.style.display = 'none';
            }

            // 이미지 크기 설정
            const imageHeight = window.innerHeight * 0.04;
            followImageAction.style.width = imageHeight * 2 + 'px';
            followImageAction.style.height = imageHeight * 2 + 'px';
            followImageBasic.style.width = imageHeight * 2 + 'px';
            followImageBasic.style.height = imageHeight * 2 + 'px';

            requestAnimationFrame(animate);
        }
    }
    animate()

    const $portfolio = $('.portfolio');
    const $sections = $('.portfolio-box');
    let portfolioIndex = 0;
    let isAnimating = false; // 애니메이션 상태 추적 변수

    // 섹션 이동 함수
    function scrollToSection(index) {
        if (isAnimating) return; // 애니메이션 중에는 함수 실행을 막음

        const targetPosition = $sections.eq(index).offset().top; // 해당 섹션의 위치
        isAnimating = true; // 애니메이션 시작

        // 페이지 스크롤을 부드럽게 이동
        $('html, body').animate({scrollTop: targetPosition}, 500, function () {
            isAnimating = false; // 애니메이션 완료 후, 스크롤 가능
        });
    }

    // 휠 이벤트 처리
    $portfolio.on('wheel', function (e) {
        e.preventDefault(); // 기본 스크롤 방지

        // 애니메이션이 진행 중이면 아무 동작도 하지 않음
        if (isAnimating) return;

        // 휠 방향에 따라 인덱스 변경
        if (e.originalEvent.deltaY > 0 && portfolioIndex < $sections.length - 1) {
            portfolioIndex++;
        } else if (e.originalEvent.deltaY < 0 && portfolioIndex > 0) {
            portfolioIndex--;
        }

        // 해당 섹션으로 이동
        scrollToSection(portfolioIndex);
    });
});

$(document).on('contextmenu', function (event) {
    event.preventDefault(); // 기본 우클릭 메뉴 방지
});

<!-- Vanta.js 설정 스크립트 -->
VANTA.NET({
    el: "#body1",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x4a6b9c,
    points: 20.00,
    backgroundColor: 0x1e3a8a
});