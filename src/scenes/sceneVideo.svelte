<script>
  export let currentTime
  export let scene
  export let id
  export let ended
  
</script>


<video class="Scene" id="{id}" bind:ended bind:currentTime={currentTime} autoplay>
    <source src="/video/{scene.file}" type="video/mp4">
  Your browser does not support the video tag.
  </video> 



<style>
video {
  z-index: 2;
}
</style>