import React from 'react';

import { angulars } from '../react-wrapper';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent } from '../utils';

const ReplicaRow = ({label, id, value, min, max, onChange, autoFocus}) => <div className="row co-m-form-row">
    <div className="col-xs-12">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number"
        className="form-control modal__input--with-label modal__input--with-units"
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        required autoFocus={autoFocus} />
      <span>replicas</span>
    </div>
  </div>;

class ConfigureHPAReplicasModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._change = this._change.bind(this);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);
    this.state = {
      minReplicas: _.get(this.props.resource.spec, 'minReplicas'),
      maxReplicas: _.get(this.props.resource.spec, 'maxReplicas')
    };
  }

  _change(event) {
    const id = event.target.id;
    let value = event.target.value;
    const numberValue = _.toNumber(value);

    if (_.isFinite(numberValue)) {
      value = numberValue;
    }

    if (id === 'min-replicas') {
      this.setState({ minReplicas: value });
    } else {
      this.setState({ maxReplicas: value });
    }
  }

  _submit(event) {
    event.preventDefault();

    const patch = [
      { op: 'replace', path: '/spec/minReplicas', value: this.state.minReplicas },
      { op: 'replace', path: '/spec/maxReplicas', value: this.state.maxReplicas },
    ];

    this._setRequestPromise(
      angulars.k8s.resource.patch(angulars.kinds.HORIZONTALPODAUTOSCALER, this.props.resource, patch)
    ).then(this.props.close);
  }

  render() {
    return <form onSubmit={this._submit} name="form">
      <ModalTitle>Modify Replica Limits</ModalTitle>
      <ModalBody>
        <div className="co-m-form-row">
          <p>
            Use replica limits to prevent an autoscaler from consuming too many resources, or removing all of your replicas. The autoscaler will react to your desired resource targets within this range.
          </p>
        </div>
        <ReplicaRow label="Minimum" id="min-replicas" value={this.state.minReplicas} min="1" max={this.state.maxReplicas} autoFocus="true" onChange={this._change} />
        <ReplicaRow label="Maximum" id="max-replicas" value={this.state.maxReplicas} min={this.state.maxReplicas} onChange={this._change} />
      </ModalBody>
      <ModalSubmitFooter
        promise={this.requestPromise}
        errorFormatter="k8sApi"
        submitText="Save Replica Limits"
        cancel={this._cancel} />
    </form>;
  }
}

ConfigureHPAReplicasModal.propTypes = {
  resource: React.PropTypes.object
};

export const configureHPAReplicasModal = createModalLauncher(ConfigureHPAReplicasModal);
