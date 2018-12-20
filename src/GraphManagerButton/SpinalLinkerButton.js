import {
  SpinalContextApp,
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";
import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";
import {SPINAL_RELATION_TYPE} from 'spinal-env-viewer-graph-service'

export default class SpinalLinkerButton extends SpinalContextApp {

  constructor() {
    super( "SpinalLinker", "Open SpinalLinker", {
      icon: "link",
      icon_type: "in",
      backgroundColor: "#ffebf8",
      fontColor: "#365bab"
    } );
  }

  isShown( option ) {
    if (option.hasOwnProperty( 'selectedNode' ) && option.selectedNode.type.get() === 'BIMObject') {
      return Promise.resolve( true );
    }

    return Promise.resolve( true );
  }

  action( option ) {
    const param = { relationName: "hasEndPoint", relationType: SPINAL_RELATION_TYPE, selectedNode: option.selectedNode };
    spinalPanelManagerService.openPanel( "plugin-spinal-linker", param );
  }

}

const TopBarName = "GraphManagerSideBar";

spinalContextMenuService.registerApp( TopBarName, new SpinalLinkerButton() );
