// No imports needed: web3, anchor, pg and more are globally available

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Staking } from "../target/types/staking";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

describe("airdrop-program", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.Staking as Program<Staking>;

  // derive PDA of the token mint and mint authority using our seeds
  let tokenMint = PublicKey.findProgramAddressSync(
    [Buffer.from("token-mint")],
    program.programId
  );
  const mintAuthority = PublicKey.findProgramAddressSync(
    [Buffer.from("mint-authority")],
    program.programId
  );
  const stakingAuthority = PublicKey.findProgramAddressSync(
    [Buffer.from("staking-authority")],
    program.programId
  );
  console.log("Token mint pda: ", tokenMint[0].toBase58());
  console.log("Mint auth pda: ", mintAuthority[0].toBase58());
  console.log("Staking auth pda: ", stakingAuthority[0].toBase58());

  const stakingVault = await getAssociatedTokenAddress(
    tokenMint[0],
    stakingAuthority[0],
    true
  );
  console.log("Staking vault: ", stakingVault.toBase58());

  const userTokenAccount = await getAssociatedTokenAddress(
    tokenMint[0],
    provider.wallet.publicKey
  );
  console.log("User ata: ", userTokenAccount.toBase58());

  const userStake = PublicKey.findProgramAddressSync(
    [provider.wallet.publicKey.toBuffer(), Buffer.from("state_account")],
    program.programId
  );
  console.log("User stake pda: ", userStake[0].toBase58());

  it("Create Mint", async () => {
    const tx = await program.methods
      .initializeMint(10)
      .accounts({
        tokenMint: tokenMint[0],
        mintAuthority: mintAuthority[0],
        payer: provider.wallet.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        stakingAuthority: stakingAuthority[0],
        stakingTokenAccount: stakingVault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([])
      .rpc();
    console.log("Initialize mint tx:", tx);
  });

  it("Airdrop tokens", async () => {
    const tx = await program.methods
      .airdrop(new anchor.BN(12))
      .accounts({
        tokenMint: tokenMint[0],
        mintAuthority: mintAuthority[0],
        user: provider.wallet.publicKey,
        userTokenAccount: userTokenAccount,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Airdrop tx:", tx);
  });

  it("Airdropping more tokens", async () => {
    const tx = await program.methods
      .airdrop(new anchor.BN(25))
      .accounts({
        tokenMint: tokenMint[0],
        mintAuthority: mintAuthority[0],
        user: provider.wallet.publicKey,
        userTokenAccount: userTokenAccount,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Airdrop tx:", tx);
  });

  it("Staking tokens", async () => {
    const tx = await program.methods
      .stake(new anchor.BN(25))
      .accounts({
        tokenMint: tokenMint[0],
        stakingAuthority: stakingAuthority[0],
        stakingTokenAccount: stakingVault,
        user: provider.wallet.publicKey,
        userTokenAccount: userTokenAccount,
        userStake: userStake[0],
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Staking tx:", tx);
  });

  it("Staking too many tokens", async () => {
    await program.methods
      .stake(new anchor.BN(13))
      .accounts({
        tokenMint: tokenMint[0],
        stakingAuthority: stakingAuthority[0],
        stakingTokenAccount: stakingVault,
        user: provider.wallet.publicKey,
        userTokenAccount: userTokenAccount,
        userStake: userStake[0],
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
  });

  it("Staking remaining tokens", async () => {
    const tx = await program.methods
      .stake(new anchor.BN(12))
      .accounts({
        tokenMint: tokenMint[0],
        stakingAuthority: stakingAuthority[0],
        stakingTokenAccount: stakingVault,
        user: provider.wallet.publicKey,
        userTokenAccount: userTokenAccount,
        userStake: userStake[0],
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Staking tx:", tx);
  });

  it("Unstaking tokens", async () => {
    const tx = await program.methods
      .unstake(new anchor.BN(25))
      .accounts({
        tokenMint: tokenMint[0],
        stakingAuthority: stakingAuthority[0],
        stakingTokenAccount: stakingVault,
        user: provider.wallet.publicKey,
        userTokenAccount: userTokenAccount,
        userStake: userStake[0],
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Unstaking tx:", tx);
  });

  it("Unstaking too many tokens", async () => {
    await program.methods
      .unstake(new anchor.BN(13))
      .accounts({
        tokenMint: tokenMint[0],
        stakingAuthority: stakingAuthority[0],
        stakingTokenAccount: stakingVault,
        user: provider.wallet.publicKey,
        userTokenAccount: userTokenAccount,
        userStake: userStake[0],
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
  });

  it("Unstaking remaining tokens", async () => {
    const tx = await program.methods
      .unstake(new anchor.BN(12))
      .accounts({
        tokenMint: tokenMint[0],
        stakingAuthority: stakingAuthority[0],
        stakingTokenAccount: stakingVault,
        user: provider.wallet.publicKey,
        userTokenAccount: userTokenAccount,
        userStake: userStake[0],
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Unstaking tx:", tx);
  });
});
