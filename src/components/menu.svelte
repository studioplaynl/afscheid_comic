<script>
import MdMenu from 'svelte-icons/md/MdMenu.svelte'
import MdClose from 'svelte-icons/md/MdClose.svelte'

let menuOpen = false;

let MenuToggle = () => { 
    menuOpen = !menuOpen
  }

</script>

<style>
  .menu-icon {
    color: black;
    width: 75px;
    height: 32px;
    margin: 15px;
    position: absolute;
    right: 0px;
    z-index: 5;
    cursor: pointer;
  }

  .menu-icon > img {
    width:64px;
  }

  .menu-icon > img:hover {
    width:75px;
  }

  li {
    list-style: none;
  }
  a {
    cursor: pointer;
    color: black;
  }

  .menu {
    background-color: white;
    padding:15px;
  }
</style>

<div class="menu-icon" on:click={MenuToggle}>
    {#if menuOpen}
        <MdClose />
    {:else}
        <img src="img/menuShoe.png">
    {/if}

    {#if menuOpen}
    <div class="menu">
        <nav>
            <li><a>Home</a></li>
            <li><a>About</a></li>
        </nav>
    </div>
    {/if}
</div>


