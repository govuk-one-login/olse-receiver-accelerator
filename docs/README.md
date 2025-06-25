# About

This is a reference repository to help accelerate the development of a GOV.UK One Login Signal Exchange Receiver. The idea behind this repository is that you can create a fork of this repository and use the code and samples written by the Signal Exchange team to speed up the development; leaving the parts specific for Relying Parties (RP's) to implement.

You can start by creating a [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks) of this repository and following our guidance below on how to use this to help development.

# About the forking model

The forking model is an approach to share code written by the Signal Exchange team while allowing RP's to write specific code. All code written by the Signal Exchange Team will be in a directory `vendor`. The code within a `vendor` directory can be imported but should not be modified as when you update your code with the lastest fork, any changes to a `vender` directory will be overridden, causing merge conflicts. There will also be an `examples` diretory maintained by the Signal Exchange Team that will have examples for how you can deploy this. Other miscellaneous and configuration files can be modified to suit your needs

Next you can read about the [receiver implementation](./receiver-implementation.md)
