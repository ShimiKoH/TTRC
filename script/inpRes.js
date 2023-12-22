const zero = ["Name", "DateTime"];
const first = ["Distance", "Time", "Rest", "Split", "Interval"];
const second = ["Result", "Average", "Rate"];
const third = ["third"];
const ON = 0;
const OFF = 1;

// 初期設定
addEventListener("DOMContentLoaded", function initial(){
    // changeDisplay(["MT", "resultData", "first", "second", "third", "final"], OFF);
    
});
addEventListener("DOMContentLoaded", tabPos);
addEventListener("resize", tabPos);


/**********************************************
 *                    関数                    *
 **********************************************/
/** idリストを取得してdisplayをonまたはoffにする関数
 * @param {string[]} idList idの文字列リスト
 * @param {number} ONorOFF 表示する>ON=0, 表示しない>OFF=1
 */
function changeDisplay(idList, ONorOFF){
    let mark = ["", "none"][ONorOFF]
    for (let id of idList){
        document.getElementById(id).style.display = mark;
    };
};
/** idリストを取得して配下のinputタグの入力可否を設定 
 * @param {string[]} idList idの文字列リスト 
 * @param {number} ONorOFF 入力不可能>ON=0, 入力可能>OFF=1 */
function changeDisabled(idList, ONorOFF){
    let flag = [true, false][ONorOFF]
    for (let id of idList){
        let inps = document.getElementById(id).getElementsByTagName("input");
        for (let elem of inps){
            elem.disabled = flag;
        };
    };
};
/** inputに入力された値が不適切ならカラーチェンジ
 * @param {string[]} idList idの文字列リスト
 * @returns {number} inputエラーの数*/
function inputJudge(idList){
    /** inputの色を変更するか否か 
     * @param {boolean} flag 判定する式(false>change)
     * @param {HTMLInputElement} doc inputElement
     * @returns {number}
    */
    function changeBGC(flag, doc){
        if (flag){
            doc.style.backgroundColor = "";
            return 0;
        } else {
            doc.style.backgroundColor = "lightpink";
            return 1;
        };
    };
    let cnt = 0
    for (let id of idList){
        let doc = document.getElementById(id);
        if (doc.style.display == "none"){
            console.log(id, "skipped");
            continue;
        };
        let inps = doc.getElementsByTagName("input");
        for (let inp of inps){
            let val = inp.value;
            console.log(id, val);
            // 判定，カラーチェンジ
            if (val == null | val == ""){
                cnt += changeBGC(false, inp);
            } else if (id == "DateTime"){
                cnt += changeBGC(true, inp);
            } else if (parseInt(val) == 0){
                cnt += changeBGC(false, inp);
            } else if (["Distance", "Split", "Interval", "Rate"].includes(id)){
                cnt += changeBGC(true, inp);
            } else if (["Time", "Rest"].includes(id)){
                cnt += changeBGC(true, inp);
            } else if (["Average", "Result"].includes(id)){
                cnt += changeBGC(val.length == 4, inp);
            } else if (id.includes("splitValue")){
                cnt += changeBGC(val.length == 6, inp);
            };
        };
    };
    return cnt;
};
/** inputで取得した文字列を変換
 * @param {String} val inputで取得した文字列
 * @param {String} elementID idまたはclassの名称
 * @returns {String} spanに登録する文字列
 */
function format(val, elementID){
    if (elementID == "Distance"){
        return pad0(val, 4);
    } else if (["Split", "Interval", "Rate"].includes(elementID)){ 
        return pad0(val, 1);
    } else if (["Time", "Rest"].includes(elementID)){
        let hour, minute, second;
        hour = minute = second = "";
        // 0埋めで五桁00000にして各値を取得
        val = pad0(val, 5);
        minute = val.slice(0,3);
        second = val.slice(3,5);
        [minute, second] = calTime(minute, second);
        [hour, minute] = calTime(0, minute)
        if (hour == "0" | hour == "00"){
            return pad0(minute, 2)+":"+pad0(second, 2);
        } else {
            return pad0(hour, 2)+":"+pad0(minute, 2)+":"+pad0(second, 2);
        };
    } else if(["Average", "Result"].includes(elementID)){
        let minute, second, microsecond;
        // 0埋めで五桁00000にして各値を取得
        val = pad0(val, 5);
        minute = val.slice(0,2);
        second = val.slice(2,4);
        microsecond = val.slice(4,5);
        [minute, second] = calTime(minute, second);
        return minute+":"+pad0(second, 2)+"."+microsecond;
    } else if(elementID.includes("splitValue")){
        let minute, second, microsecond, rate;
        val = pad0(val, 6)
        minute = val.slice(0,1);
        second = val.slice(1,3);
        [minute, second] = calTime(minute, second);
        microsecond = val.slice(3,4);
        rate = val.slice(4,6);
        return minute+":"+pad0(second,2)+"."+microsecond+"("+rate+")";
    };
};
/** 0埋め
 * @param {string | number} val 文字列または数値
 * @param {number} digit 全桁数
 * @param {string} side left or right
 * @returns {string} 文字列
 */
function pad0(val, digit, side="left"){
    val = val.toString();
    let num = digit - val.length;
    if (num>=0){
        if (side == "left"){
            return "0".repeat(num) + val;
        } else {
            return val + "0".repeat(num);
        };
    } else {
        return val;
    };
};
/** 時間の計算，lowが60以上なら上に繰り上げして返す
 * @param {string | number} high 高位
 * @param {string | number} low 低位
 * @returns {string[]}
 */
function calTime(high, low){
    high = parseInt(high);
    low = parseInt(low);
    while (low >= 60) {
        high += 1;
        low -= 60;
    };
    return [high.toString(), low.toString()];
};
/** splitまたはintervalの表示されている数値を取得
 * @returns {number}
 */
function numSplInt() {
    let num = 0;
    for (let tag of ["Split", "Interval"]) {
        let spl = document.getElementById(tag);
        if (spl.style.display == "") {
            num = parseInt(spl.getElementsByTagName("input")[0].value);
        };
    };
    return num;
};
/** 横幅1200px以上のとき，送信ボタンの位置を移動 */
function moveButton(){
    let buttonD = document.getElementById("final") //buttonDocument
    if (window.innerWidth >= 1200){
        let tH = document.getElementById("resultData").offsetHeight; //tableHeight
        let buttonH = buttonD.offsetHeight; //buttonHeight
        let baseH = document.getElementById("base").offsetHeight //baseHeight
        if (baseH + buttonH > tH){
            // 中央に配置
            console.log("center")
            buttonD.style.left = "50%"
            buttonD.style.top = "0px"
            return;
        } else {
            // 左のブロックの中央に配置
            let top = (buttonH+tH-baseH)/2
            buttonD.style.left = "25%px"
            buttonD.style.top = "-"+top+"px"
            console.log("top",top)
        };
    } else {
        buttonD.style.top = "0px"
    }
}
/** resultDataの位置調整 */
function tabPos(){
    let res = document.getElementById("resultData");
    if (window.innerWidth >= 1200){
        let baseH = document.getElementById("base").offsetHeight;
        res.style.marginTop = "-"+baseH+"px";
    } else {
        res.style.marginTop = "0px";
    };
};
/** inputに入力された値を整形 */
function convert(id){
    let inp = document.getElementById(id).getElementsByTagName("input")[0];
    let out = document.getElementById(id).getElementsByClassName("output")[0];
    let val = inp.value;
    val = val.replace(/[^0-9]+/i, "");
    inp.value = val;
    let len = val.length;
    if (len == 0){val = 0};
    val = format((val), id);
    out.textContent = val;
};
/** third のsplitValuesを削除する関数 
 * @param {number} num  既存のsplitValueの数
*/
function removeSpVal(num){
    for (let i = 1; i <= num; i++){
        document.getElementById("splitValue"+i).remove();
    };
};
/** ResultまたはAverageを表示する
 * @returns {boolean} 2000TT>true, the others>false
 */
function ResAve(){
    /** @type {HTMLInputElement} */
    let SD = document.getElementsByName("Type")[0];
    let num = parseInt(document.getElementById("Distance").getElementsByTagName("input")[0].value);
    if (SD.checked && num == 2000){
        return true;
    } else {
        return false;
    };
};

/**************************************************************
 *                 以降はボタン操作等の処理                     *
***************************************************************/
/** splitVlaueの並べ替えのソース*/
class sortSplit {
    /** 
     * @param {number} i identifier
     * @param {number} num all 
    */
    constructor(num){
        // /** number of splitValue (clicked) */
        // this.index = i;
        /** amount of splitValue */
        this.num = num;
        /** @type {} X range of valid area */
        this.coordRangeX = {};
        /** Y range of valid area of each splitValue */
        this.coordRangeYs = {};
        /** @type {HTMLTableRowElement} splitValue table row element */
        this.spl_tr;
        /** @type {HTMLImageElement} splitValue img element */
        this.spl_img;
        /** @type {HTMLTableRowElement} separator table row element */
        this.sep_tr;
        /** @type {number} horizonal position (longtitude) of mouse */
        this.x;
        /** @type {number} vartical position (latitude) of mouse */
        this.y;
        /** @type {number[]} separator index which is exist at both side of dragged row */
        this.sep_trsprnt;
        /** @type {number} opaque separator index */
        this.index;
        /** @type {string[]} List of inputed value for sorting */
        this.sortList;

        this.init();
    };

    init(){
        this.source();
        this.target();
    };
    /*--------------------------------------------- 
    source = splitValue
    ----------------------------------------------*/
    /** イベントの追加 */
    source(){
        // デバイスタイプ touch/mouse
        let supportouch = "ontouchstart" in document;
        let EVENTNAME_TS = supportouch ? "touchstart" : "mousedown";
        let EVENTNAME_TE = supportouch ? "touchend" : "mouseup";
        // イベントの追加
        for (let i=1; i<=this.num; i++){
            // 引数のパラメータ取得
            let id = `splitValue${i}`
            let elem_tr = document.getElementById(id);
            let elem_img = elem_tr.getElementsByTagName("img")[0];
            elem_img.addEventListener(EVENTNAME_TS, (eve)=>{this.start(eve)}, false);
            elem_tr.addEventListener("drag", (eve)=>{this.drag(eve)}, false);
            elem_tr.addEventListener("dragend", (eve)=>{this.end(eve)}, false);
            elem_img.addEventListener(EVENTNAME_TE, (eve)=>{this.end(eve)}, false);
        };
    };
    target(){
        // for (let i=0; i<=this.num; i++){
        //     let id = `separator${i}`
        //     let sep = document.getElementById(id);
        //     sep.addEventListener("dragover", (eve)=>this.over(eve), false);
        //     // sep.addEventListener("drop", (eve)=>this.drop(eve), false);
        // };
        document.getElementById("third").addEventListener("dragover", (eve)=>{this.over(eve), false});
    };
    /**クリック(長押し)の処理
     * @param {MouseEvent} event 
    */ 
    start(event){
        // this.spl_tr, this.spl_imgの更新(設定しないとクラス作成時のsplitValue4に固定)
        this.spl_img = event.target;
        this.spl_img.style.cursor = "grabbing"
        this.spl_tr = this.spl_img.parentNode.parentNode;
        this.spl_tr.classList.add("drag");
        this.spl_tr.draggable = true;
        // console.log(this.draggingID);
        // coordRangeXの設定
        let docThird = document.getElementById("third").getBoundingClientRect();
        this.coordRangeX = {
            left: docThird.left,
            right: docThird.right,
        };
        // splitVlaueの座標を取得
        this.getCoords();
        // console.log(event.pageX, event.pageY)
        // console.log(this.coordRangeX);
        // console.log(this.coordRangeYs);
        let n = parseInt(this.spl_tr.id.slice(10));
        this.sep_trsprnt = [n-1, n];
        this.index = n-1;
    };
    /**
     * ドラッグ中のイベント
     * @param {DragEvent} event 
     */
    drag(event){
        this.x = event.pageX;
        this.y = event.pageY;
        // console.log("----------------------")
        for (let i=this.index-1; i<=this.index+1; i++){
            if (i<0 | this.num<i){continue};
            let sep_id = `separator${i}`;
            let left = this.coordRangeX["left"];
            let right = this.coordRangeX["right"];
            let top = this.coordRangeYs[sep_id]["top"];
            let bottom = this.coordRangeYs[sep_id]["bottom"];
            if ((top<=this.y) && (this.y<bottom)){
                // console.log(i,"opaque")
                this.index = i;
                if (this.x<left | right<this.x){continue};
                if (this.sep_trsprnt.includes(this.index)){continue};
                this.changeOpacity(sep_id, 1);
            } else {
                // console.log(i,"transparent")
                this.changeOpacity(sep_id, 0.01);
            };
        };
    };
    /** ドラッグを終えて離したときorクリックを話したとき
     * @param {MouseEvent|DragEvent} event 
    */
    end(event){
        // console.log(event.target.id, event.type);
        this.spl_img.style.cursor = "grab"
        this.spl_tr.classList.remove("drag");
        this.spl_tr.draggable = false;

        let sep_id = `separator${this.index}`
        let opa = document.getElementById(sep_id).getElementsByTagName("img")[0].style.opacity;
        if (opa == "0"){return}
        console.log(sep_id);
        this.sortValue(this.sep_trsprnt[1], this.index);
        this.changeOpacity(sep_id, 0)
    };
    /*-------------------------------------
                target = separator
    --------------------------------------*/
    /**
     * 
     * @param {DragEvent} event dragover
     */
    over(event){
        let top = this.coordRangeYs[`separator${0}`]["top"];
        let bottom = this.coordRangeYs[`separator${this.num}`]["bottom"];
        if (top<=this.y && this.y<=bottom){
            event.preventDefault()
        };
    };
    /*---------------------------------
                その他関数
    ---------------------------------*/
    /** クリックされたものを取得して，それをドラッグした際のseparatorの表示非表示を決める境界座標を返す */
    getCoords(){
        /**
         * separatorのY座標を返す
         * @param {number} num 
         * @returns {number}
         */
        let getCoord=(num)=>{return(window.scrollY+document.getElementById(`separator${num}`).getBoundingClientRect().top)};
        let sep = [getCoord(0), getCoord(this.num-1)];
        // splitValueの高さ
        let height = (sep[1]-sep[0])/(this.num-1);
        let res = {};
        for (let i=0; i<=this.num; i++){
            let cY = getCoord(i);
            let coord = {
                "top": cY-height/2,
                "bottom": cY+height/2,
            };
            res[`separator${i}`] = coord;
        };
        this.coordRangeYs = res;
    };
    /**
     * 透明度の変更
     * @param {string} id id
     * @param {number} param 0(transparent) < param < 1(opaque)
     */
    changeOpacity(id, param){
        document.getElementById(id).getElementsByTagName("img")[0].style.opacity = `${param}`;
    };
    /**
     * 
     * @param {number} bef drag from...
     * @param {number} aft drag to...
     */
    sortValue(bef, aft){
        this.sortList = [];
        let index = ((aft-bef)/Math.abs(aft-bef)); // 正方向移動で1, 逆方向移動で-1
        let min = Math.min(bef, aft)-(index-1)/2;
        let max = Math.max(bef, aft);
        // console.log(bef,aft);
        for (let i=min; i<=max; i++){
            let inp = document.getElementById(`splitValue${i}`).getElementsByTagName("input")[0];
            this.sortList.push(inp.value);
        };
        // console.log(this.sortList);
        let prev = this.sortList.slice(index, undefined);
        let folw = this.sortList.slice(undefined, index);
        this.sortList = prev.concat(folw)
        // console.log(this.sortList);
        for (let i=min; i<=max; i++){
            document.getElementById(`splitValue${i}`).getElementsByTagName("input")[0].value = this.sortList[i-min];
            convert(`splitValue${i}`);
        };
    };
};
/** thirdのsplitValueを入れ替える 
 * @param {number} num splitValueの数
*/
let sortUI = (num)=>{
    new sortSplit(num);
};

/** inputResultで入力されたIDからLogBookページを開き、正しいIDか判断する関数 */
function openLog(){
    let id = document.getElementById("LogbookID").value;
    if (id == "") {
        alert("IDを入力してください");
    } else {
        console.log("ID :", id);
        let url = "https://log.concept2.com/profile/" + id + "/log";
        console.log("URL :", url);
        open(url);
    };
};

/** 
 * NameとDatetimeを入力可能/不可能にする
 * @param {Boolean} flag フラグ
 */
function zeroNext(flag){
    console.log("zeroNext>",flag)
    if (flag){
        let cnt = inputJudge(zero);
        console.log("ERROR",cnt)
        if (cnt != 0){
            alert("未記入の項目があります");
            return;
        } else {
            // 表示
            changeDisplay(["MT", "menuButton"], ON);
            // 非表示
            changeDisplay(["zeroButton"], OFF);
            // 入力不可
            changeDisabled(zero, ON);
        };
    };
};

/** メニューの種類を選択した後に押すボタン */
function selectMenu(flag = true){
    console.log("selectMenu>", flag)
    if (flag){
        /** @type {HTMLCollectionOf<HTMLInputElement>} */
        let types = document.getElementsByName("Type");
        let onDisplay = [
            ["Distance", "Split"],
            ["Time", "Split"],
            ["Distance", "Rest", "Interval"],
            ["Time", "Rest", "Interval"],
        ];
        let cnt = 0;
        for (let i = 0; i < types.length; i++){
            if (types[i].checked){
                cnt += 1;
                // すべての列を非表示
                changeDisplay(first, OFF)
                // 当該列を再表示
                changeDisplay(onDisplay[i], ON)
            };
        };
        if (cnt == 0){
            alert("メニューの種類を選択してください");
            return;
        } else {
            //表示
            changeDisplay(["resultData", "first","firstButton"], ON);
            //非表示
            changeDisplay(["menuButton"], OFF);
            // 入力不可
            changeDisabled(["MT"], ON);
            // tableの位置調整
            tabPos();
        };
    } else {
        // 再表示
        changeDisplay(["zeroButton"], ON);
        // 非表示
        changeDisplay(["MT"], OFF);
        // 入力許可
        changeDisabled(["base"], OFF);
    };
};

/** firstNext */
function firstNext(flag){
    console.log("firstNext>", flag);
    if (flag){
        // 空白チェック
        if (inputJudge(first) != 0){
            alert("空欄があります");
            return;
        };
        changeDisplay(second, OFF);
        // ResultかAverageを表示
        if (ResAve()){
            changeDisplay(["Result", "Rate"], ON);
        } else {
            changeDisplay(["Average", "Rate"], ON);
        };
        // 表示
        changeDisplay(["second"], ON);
        // 非表示
        changeDisplay(["firstButton"], OFF);
        // 入力不可
        changeDisabled(first, ON);
    } else {
        // 再表示
        changeDisplay(["menuButton"], ON);
        // 非表示
        changeDisplay(["resultData"], OFF);
        // 入力許可
        changeDisabled(["MT"], OFF);
    };
};

/** 表のsecondが押された際にsplitの入力項目を表示する */
function secondNext(flag = true){
    console.log("secondNext>", flag);
    if (flag){
        // 空白チェック
        if (inputJudge(second) != 0){
            alert("空欄があります");
            return
        };
        // 入力するにチェックが入った状態にする
        document.getElementsByName("split")[0].checked = true;
        // class = "splitValue"の数の検索
        let cnt = document.getElementsByClassName("splitValue").length;
        // Split/Intervalの表示するべき数
        let num = numSplInt();
        console.log("exist:",cnt,"/create:",num)
        // 既にあるsplitValueの数が表示するべき数に一致する場合，追加過程をスキップ
        if (cnt != num){
            // 既にあるsplitValueを削除
            removeSpVal(cnt);
            // 表の入力欄のノードの作成
            let inp = document.createElement("input");
            inp.setAttribute("type", "text");
            inp.setAttribute("inputmode", "numeric");
            inp.setAttribute("maxlength", "6");
            // sortPictureのノード作成
            let img = document.createElement("img");
            img.setAttribute("class", "sort-pic")
            img.setAttribute("src", "../svg/sortable.svg");
            img.setAttribute("alt", "SORT-UI-IMAGE");
            img.setAttribute("draggable", "false");
            // separatorの作成
            let sep_tr = document.createElement("tr");
            let sep_td = document.createElement("td");
            let sep = document.createElement("img");
            sep_tr.classList.add("separator");
            sep_td.setAttribute("colspan", "5");
            sep.setAttribute("src", "../svg/separator.svg");
            // sep.setAttribute("alt", "SEPARATE-LINE");
            sep_td.append(sep);
            sep_tr.append(sep_td);
            // 表のデータのノードを作成
            let td0 = document.createElement("td");
            let td2 = document.createElement("td");
            let td3 = document.createElement("td");
            let span0 = document.createElement("span");
            td0.append(img)
            td0.setAttribute("class", "col0");
            td2.append(inp);
            td3.setAttribute("class", "output");
            td3.setAttribute("colspan", "2")
            span0.textContent = "0";
            td3.append(span0.cloneNode(true), ":", span0.cloneNode(true), span0.cloneNode(true), ".", span0.cloneNode(true), "(", span0.cloneNode(true), ")")
            // 親ノードの欠片を生成
            let parent = document.createDocumentFragment();
            // 繰り返し処理
            for (let i = 1; i <= num; i++) {
                // idの作成
                let id = "splitValue" + i;
                // 表の列のノードの作成
                let child_tr = document.createElement("tr");
                // child_tr.setAttribute("class", "input-short")
                // [戻る]ボタンをクリックしたときに入力欄をまとめて削除するためにクラスを命名(新規)
                child_tr.classList.add("splitValue", "col1")
                child_tr.setAttribute("id", id);
                child_tr.setAttribute("draggable", "false");
                // 1行目のデータのノードを新規作成
                let td1 = document.createElement("td");
                td1.append(i.toString());
                child_tr.append(td0.cloneNode(true), td1, td2.cloneNode(true), td3.cloneNode(true));
                child_tr.getElementsByTagName("input")[0].setAttribute("oninput", `convert('${id}')`);
                // console.log("${i}");
                sep_tr.setAttribute("id", `separator${i}`);
                parent.append(child_tr, sep_tr.cloneNode(true));
            };
            document.getElementById("third").children[2].after(parent);
            sortUI(num);
        };
        // 表示
        changeDisplay(third, ON);
        // 非表示
        changeDisplay(["secondButton"], OFF);
        // 入力不可
        changeDisabled(second, ON);
    } else {
        // 再表示
        changeDisplay(["firstButton"], ON);
        // 非表示
        changeDisplay(["second"], OFF);
        // 入力許可
        changeDisabled(first, OFF);
    };
};

/** 
 * class=splitValueの記入可否, input[type=radio]から呼び出し
 * @param {boolean} flag 
 */
function inputSplit(flag){
    console.log("inputSplit>",flag)
    function offSpVal(flag){
        for (let elem of document.getElementsByClassName("splitValue")) {
            elem.style.display = flag;
        };
    };
    if (flag) {
        offSpVal("");
    } else {
        offSpVal("none");
    };
};
/** thirdの次へボタンの処理 */ 
function thirdNext(flag){
    console.log("thirdNext>",flag)
    if (flag){
        // 空白チェック
        let num = document.getElementsByClassName("splitValue").length;
        let cnt = 0;
        for (i=1; i<=num; i++){
            cnt += inputJudge(["splitValue"+i]);
        };
        if (cnt != 0){
            alert("空欄があります");
            return;
        };
        // 表示
        changeDisplay(["final"], ON);
        // 非表示
        changeDisplay(["thirdButton"], OFF);
        // 入力不可
        changeDisabled(["third"], ON);
        // ボタン再配置
        moveButton()
    } else {
        // 再表示
        changeDisplay(["secondButton"], ON);
        // 非表示
        changeDisplay(["third"], OFF);
        // 記入許可
        changeDisabled(second, OFF);
    };
};

/** final */
function final(){
    console.log("final>")
    // 再表示
    changeDisplay(["thirdButton"], ON);
    // 非表示
    changeDisplay(["final"], OFF);
    // 入力許可
    changeDisabled(["third"], OFF)
};

