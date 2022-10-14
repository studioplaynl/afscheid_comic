<script>
  export let videoElement
  export let scene
  export let id
  
</script>


<video class="Scene{id}" bind:this="{videoElement}" autoplay>
    <source src="/video/{scene.file}" type="video/mp4">
  Your browser does not support the video tag.
  </video> 



<style>
video {
  z-index: 2;
}
</style>