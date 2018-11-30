/// <amd-module name="Env/_Request/StateReceiver" />
import {
    ISerializableState,
    IStateReceiver,
    IConsole
} from 'Env/_Request/interface';

type StateMap = HashMap<HashMap<string>>;
export type StateReceiverConfig = {
    states?: StateMap,
    console?: IConsole
}

/**
 * Класс, реализующий интерфейс {@link Core/Request/IStateReceiver},
 * позволяющий сохранять состояние компонентов
 *
 * @class
 * @name Env/_Request/StateReceiver
 * @implements Core/Request/IStateReceiver
 * @author Заляев А.В
 * @private
 */
// tslint:disable-next-line
export default class StateReceiver implements IStateReceiver {
    private __states: StateMap = Object.create(null);
    private __components: HashMap<ISerializableState> = Object.create(null);
    private readonly __console: IConsole;
    constructor({
        states,
        console
    }: StateReceiverConfig = {}) {
        this.__states = states;
        this.__console = console;
    }
    /**
     * Получеие сериализованного состояния всех зарегестрированных компонент
     * @return {String}
     * @method
     * @name Env/_Request/StateReceiver#serialize
     */
    serialize(): string {
        let states: StateMap = Object.create(null);
        for (let uid in this.__components) {
            states[uid] = this.__components[uid].getState();
        }
        return JSON.stringify(states);
    };

    /**
     * Метод, устанавливающий состояние всем зарегестрированным компонентам.
     * @param {String} data
     * @method
     * @name Env/_Request/StateReceiver#deserialize
     */
    deserialize(data: string): void {
        try {
            this.__states = JSON.parse(data);
            this.__updateState();
        } catch (error) {
            this.__console && this.__console.error(error);
        }
    };

    /**
     * Регистрация компонентов, состояние которыех необходимо сохранить.
     * @param {String} uid идентификатор инстанса, для идентификации сохраненного для него состояния
     * @param {Core/Request/ISerializableState} component Сериализируемый компонент
     * @method
     * @name Env/_Request/StateReceiver#register
     */
    register(uid: string, component: ISerializableState): void {
        if (this.__components[uid]) {
            throw new Error('exist'); // TODO fix error message
        }
        this.__components[uid] = component;
        if (this.__states[uid]) {
            this.__setComponentState(uid);
        }
    };
    unregister(uid: string) {
        delete this.__components[uid];
    }
    private __updateState() {
        for (let uid in this.__states) {
            this.__setComponentState(uid);
        }
    }
    private __setComponentState(uid: string) {
        let serializableState = this.__components[uid];
        if (serializableState || serializableState.setState) {
            serializableState.setState(this.__states[uid]);
            // После того как отдали состояние компоненту, чистим дубли в себе
            delete this.__states[uid];
        }
    }
}
