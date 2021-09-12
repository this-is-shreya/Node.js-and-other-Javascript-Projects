$("#b").on("click",function(){
  var id = document.getElementById("id").value
  var pos = document.getElementById("pos").value
 
  var top = $("#"+id).offset().top


  var other_height=[]
  var o=[]
  for(var i =1;i<=5;i++){
    var a =($("#"+i).offset().top)
    other_height.push(a)
    o.push(a)
    
  }
 
var index=0

i=top - o.sort()[pos]
if(i>0){
  for(var j =0;j<5;j++){
        index++
    if(other_height[j]>=(top-i)&& top>other_height[j]){
    $("#"+index).animate({
      "top":"+=120px"
    },"slow")
  }
  }
  
$("#"+id).animate({ 
  "top":"-="+i+"px"
},"slow")
}

if(i<0){
  index=0
  for(var j =0;j<5;j++){
    index++
    i=Math.abs(o.sort()[pos] - top)
    
if(other_height[j]>(top) && other_height[j]<=(top+i)){

$("#"+index).animate({
  "top":"-=120px"
},"slow")
}
}

$("#"+id).animate({ 
"top":"+="+i+"px"
},"slow")
}
})
