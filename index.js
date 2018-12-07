import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";
import SpinalLinker from "./src/SpinalLinker.vue";
import "./src/GraphManagerButton/SpinalLinkerButton";
import store from "./src/store";
import Vue from 'vue';

const extentions = SpinalForgeExtention.createExtention( {
  name: "plugin-spinal-linker",
  vueMountComponent: Vue.extend( {
    render: h => h( SpinalLinker ),
    methods: {
      opened: function ( option ) {
        store.commit( 'SET_RELATION_NAME', option.relationName );
        store.commit( 'SET_RELATION_TYPE', option.relationType );
        store.commit( 'SET_INSPECTED_NODE', option.selectedNode );
        option.selectedNode.getChildren( [] ).then( children => {
          for (let i = 0; i < children.length; i++) {
            store.commit( 'ADD_NODE', children[i] );
          }
        } );
      },
      closed: function () {

      },
      removed: function () {
      }
    },
    store
  } ),

  panel: {
    title: "Spinal Linker",
    className: "plugin-spinal-linker",
    closeBehaviour: "delete"
  },
  style: {
    height: '80vh'
  }
} );

SpinalForgeExtention.registerExtention( "plugin-spinal-linker", extentions );
