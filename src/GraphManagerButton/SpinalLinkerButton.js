import {
  SpinalContextApp,
  spinalContextMenuService,
} from 'spinal-env-viewer-context-menu-service';
import {
  spinalPanelManagerService,
} from 'spinal-env-viewer-panel-manager-service';
import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-env-viewer-graph-service';
import SpinalNode from 'spinal-model-graph/build/Nodes/SpinalNode';

export default class SpinalLinkerButton extends SpinalContextApp {
  constructor() {
    super('SpinalLinker', 'Open SpinalLinker', {
      icon: 'link',
      icon_type: 'in',
      backgroundColor: '#ffebf8',
      fontColor: '#365bab',
    });
  }

  isShown(option) {
    if (option.selectedNode instanceof SpinalNode) {
      return Promise.resolve(true);
    } else {
      if (
        option.hasOwnProperty('selectedNode') &&
        option.selectedNode.type.get() === 'BIMObject'
      ) {
        return Promise.resolve(true);
      }

      return Promise.resolve(true);
    }
  }

  action(option) {
    let selectedNode = option.selectedNode;
    if (option.selectedNode instanceof SpinalNode) {
      selectedNode = SpinalGraphService.getInfo(option.selectedNode.getId());
    }
    const param = {
      relationName: 'hasEndPoint',
      relationType: SPINAL_RELATION_PTR_LST_TYPE,
      selectedNode: selectedNode,
    };
    spinalPanelManagerService.openPanel('plugin-spinal-linker', param);
  }
}

const TopBarName = 'GraphManagerSideBar';
const circularMenuName = 'circularMenu';

spinalContextMenuService.registerApp(TopBarName, new SpinalLinkerButton());
spinalContextMenuService.registerApp(
  circularMenuName,
  new SpinalLinkerButton()
);