$(document).ready(function () {
    let logoutLi = ``;

    if (localStorage.getItem('nickname')) {
        logoutLi = `
                    <li>
                        <div class="button submenu-item logout_bt">로그아웃</div>
                    </li>
                    `
    }

    $('.head-line').append(`
        <div class="menu-bg">
            <div class="menu-container">
                <ul class="menu">
                    <li class="submenu-container">
                        <div>
                            <div class="button">메 뉴</div>
                        </div>
                        <ul class="submenu">
                            <li>
                                <a href="../member/myPage.html">
                                    <div class="button submenu-item">내정보</div>
                                </a>
                            </li>
                            <li>
                                <a href="../shop/shop.html">
                                    <div class="button submenu-item">상 점</div>
                                </a>
                            </li>
                            <li>
                                <a href="../garden/myGarden.html">
                                    <div class="button submenu-item">정 원</div>
                                </a>
                            </li>
                            <li>
                                <a href="../community/main.html">
                                    <div class="button submenu-item">전체게시판</div>
                                </a>
                            </li>
                            <li>
                                <a href="../community/main.html?boardId=1">
                                    <div class="button submenu-item">공지사항</div>
                                </a>
                            </li>
                            <li>
                                <a href="../community/main.html?boardId=2">
                                    <div class="button submenu-item">자유게시판</div>
                                </a>
                            </li>
                            <li>
                                <a href="../community/main.html?boardId=3">
                                    <div class="button submenu-item">Q & A</div>
                                </a>
                            </li>
                            ${logoutLi}
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
`)
});

$(document).on('click', '.logout_bt', function () {
    localStorage.removeItem('nickname');
    location.reload();
});