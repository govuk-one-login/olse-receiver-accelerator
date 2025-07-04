// import { validateJWT } from "./validateJWT";
// import * as jose from 'jose'

// // const { publicKey, privateKey } = jose.generateKeyPair('PS256', {
// //         extractable: true,
// //     })
// const JWKS = jose.createLocalJWKSet({
//   keys: [
//     {
//       kty: 'RSA',
//       e: 'AQAB',
//       n: '12oBZRhCiZFJLcPg59LkZZ9mdhSMTKAQZYq32k_ti5SBB6jerkh-WzOMAO664r_qyLkqHUSp3u5SbXtseZEpN3XPWGKSxjsy-1JyEFTdLSYe6f9gfrmxkUF_7DTpq0gn6rntP05g2-wFW50YO7mosfdslfrTJYWHFhJALabAeYirYD7-9kqq9ebfFMF4sRRELbv9oi36As6Q9B3Qb5_C1rAzqfao_PCsf9EPsTZsVVVkA5qoIAr47lo1ipfiBPxUCCNSdvkmDTYgvvRm6ZoMjFbvOtgyts55fXKdMWv7I9HMD5HwE9uW839PWA514qhbcIsXEYSFMPMV6fnlsiZvQQ',
//       alg: 'PS256',
//     },
//     {
//       crv: 'P-256',
//       kty: 'EC',
//       x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
//       y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo',
//       alg: 'ES256',
//     },
//   ],
// })
// describe('validateJWT', () => {
//   test('should return false if JWT is not valid', () => {
//     expect(validateJWT("aaaaa.bbbb.ccccc", JWKS)).toBe(false)
//   })
// })
