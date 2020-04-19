function getElementsInString(str) {
  var parts = [];
  while (str.indexOf("<") != -1) {
    var sl = str.slice(0, str.indexOf(">")+1);

    console.log("==")
    console.log(`(${sl})`)
    console.log("==")

    str = str.replace(sl, "");

    parts.push(sl);

  }
  console.log(str)
}

var elms = getElementsInString(`<tr data-craftable='1'><td>A Brush with Death</td><td>Cosmetic
            </td><td abbr='0'></td><td abbr='0'></td><td abbr="3.94"
                        style='border-color: #FFD700; background-color: #d2aa00'><a class='qlink'
                           href='/stats/Unique/A%20Brush%20with%20Death/Tradable/Craftable'
                           data-tip=top
                           title='$0.16'>
                            3.88–4 ref

                                                                    </a></td><td abbr="361.29"
                        style='border-color: #CF6A32; background-color: #a23d05'><a class='qlink'
                           href='/stats/Strange/A%20Brush%20with%20Death/Tradable/Craftable'
                           data-tip=top
                           title='361.29 ref, $14.45'>
                            6.65 keys

                                                                    </a></td><td abbr='0'></td><td abbr="10866"
                        style='border-color: #830000; background-color: #560000'><a class='qlink'
                           href='/stats/Collector%27s/A%20Brush%20with%20Death/Tradable/Craftable'
                           data-tip=top
                           title='10,866.00 ref, $434.64'>
                            200 keys

                                                                    </a></td></tr>`);

console.log(elms);
