<script>
  export let videoElement
  export let currentScene
</script>


<video class="Scene01" bind:this="{videoElement}" autoplay>
    <source src="/video/Scene01.m4v" type="video/mp4">
  Your browser does not support the video tag.
  </video> 

  <div><img on:click="{()=>{currentScene = 1}}" class="skip" src="img/skipIntro.png"></div>



<style>

video {
  z-index: 1;
}

.skip {
    z-index: 10;
    position: absolute;
    top: 80vh;
    left: 46vw;
    width: 8vw;
}

.skip:hover {
  top: 79vh;
  width:10vw;
  left: 45vw;
  cursor: pointer;
}

</style>