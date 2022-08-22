export function wait(time:number = 100):Promise<null>{
    return new Promise(resolve => {
      setTimeout(function(){
        // //console.log("waited ", time);
        resolve(null);
      }, time);
    });
}