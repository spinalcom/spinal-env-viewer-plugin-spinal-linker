<template>
    <li>
        <div class="plugin-linker-header">
            <drop-up-down-button
                    :opened="open"
                    @click="toggle"
            />
            {{name}}
            <spinal-icon-button
                    v-if="canLink"
                    class="plugin-linker-link-button"
                    icon="link"
                    tool-tip="link node"
                    @click="link"
            />
            <spinal-icon-button
                    v-else
                    class="plugin-linker-link-button"
                    icon="link_off"
                    tool-tip="unlink node"
                    @click="unlink"
            />
        </div>
        <ul v-if="open">
            <node-item
                    v-for="(nodeId, index) in node.childrenIds"
                    :nodeId="nodeId"
                    :key="index"
                    :invert-link="invertLink"
                    :link-id="linkId"
                    :link-relation-name="linkRelationName"
                    :link-relation-type="linkRelationType"
            />
        </ul>
    </li>
</template>

<script>
  import {
    SpinalIconButton,
    DropUpDownButton
  }
    from "spinal-env-viewer-vue-components-lib";
  import { SpinalGraphService } from "spinal-env-viewer-graph-service";

  export default {
    name: "nodeItem",
    components: { DropUpDownButton, SpinalIconButton },
    data: function () {
      return {
        node: {},
        open: false
      }
    },
    props: {
      nodeId: {
        type: String,
        required: true
      },
      invertLink: {
        type: Boolean,
        default: false
      },
      linkId: {
        type: String,
        required: true
      },
      linkRelationName: {
        type: String,
        default: 'HasBeenLink'
      },
      linkRelationType: {
        type: String,
        default: SpinalGraphService.SPINAL_RELATION_PTR_LST_TYPE
      }
    },
    computed: {
      name: function () {
        if (this.node && this.node.hasOwnProperty( 'name' )) {
          return this.node.name.get();
        }
        return 'Unknown name';
      },
      hasChildren: function () {
        if (this.node && this.node.hasOwnProperty( 'childrenIds' ))
          return false;
        return false;
      }
    },
    asyncComputed: {
      canLink: {
        get: async function () {
          if (this.node && this.node.hasOwnProperty( 'id' )) {
            let res = await SpinalGraphService
              .isChild( this.linkId, this.node.id.get(), [this.linkRelationName] );
            if (this.invertLink)
              res = await SpinalGraphService
                .isChild( this.node.id.get(), this.linkId, [this.linkRelationName] );
            return res === false;
          }
          return false;
        },
        default: false
      },

    },
    methods: {
      link: function () {
        if (this.invertLink) {
          SpinalGraphService.addChild( this.node.id.get(), this.linkId,
            this.linkRelationName, this.linkRelationType );
        } else {
          console.log('link relation type', this.linkRelationType)
          SpinalGraphService.addChild( this.linkId, this.node.id.get(),
            this.linkRelationName, this.linkRelationType );
        }
      },
      unlink: function () {


        if (this.invertLink) {
          SpinalGraphService.removeChild( this.node.id.get(), this.linkId,
            this.linkRelationName, this.linkRelationType ).then( () => {
              console.log( 'unlink inverted' );
            } )
            .catch( e =>
              console.error( e ) );
        } else {

          SpinalGraphService.removeChild( this.linkId, this.node.id.get(),
            this.linkRelationName, this.linkRelationType )
            .then( () => {
              console.log( 'unlink' );
            } )
            .catch( e =>
              console.error( e )
            );
        }
      },
      toggle: function () {
        this.open = !this.open
      }
    },
    mounted() {
      this.node = SpinalGraphService.getNode( this.nodeId );
    }
  }
</script>

<style scoped>
    li{
        list-style-type: none;
    }
    .plugin-linker-header{
        display: flex;
    }
</style>