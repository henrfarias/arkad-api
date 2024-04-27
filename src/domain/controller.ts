export abstract class Controller {
  abstract execute(): Promise<void>
  abstract done(): void
}
