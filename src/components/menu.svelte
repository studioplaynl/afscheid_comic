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
width: 32px;
height: 32px;
margin: 15px;
position: absolute;
right: 0px;
z-index: 5;
cursor: pointer;
  }

  .menu{

  }

  li {

  }
  a {
    cursor: pointer;
    color: black;
  }
</style>

<div class="menu-icon" on:click={MenuToggle}>
    {#if menuOpen}
        <MdClose />
    {:else}
        <MdMenu />
    {/if}

    {#if menuOpen}
    <div class="menu">
        <nav>
            <li><a>Home</a></li>
            <li><a>About us</a></li>
        </nav>
    </div>
    {/if}
</div>


